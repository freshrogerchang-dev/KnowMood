import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase, isCloudEnabled } from './supabase'

const KEY = 'knowmood.v1'
const MAX_ATTEMPTS = 800 // 本機只留最近的練習紀錄，避免 localStorage 爆掉

export const DEFAULT_SETTINGS = {
  level: 1,            // 1=4種核心情緒 2=+驚訝/平靜 3=全部8種
  disabledEmotions: [],
  choices: 2,          // 每題選項數（2→4 漸進）
  roundLength: 6,      // 一輪幾題
  speech: true,        // 語音朗讀
  speechRate: 0.85,
  sound: true,         // 音效
  motion: true,        // 動畫
  zhuyin: true,        // 情緒名稱加注音
  lowSensory: false,   // 低感官負荷模式
}

const uid = () =>
  (globalThis.crypto?.randomUUID?.() ??
    `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`)

const blank = () => ({
  profileId: uid(),
  childName: '',
  stars: 0,
  stickers: [],
  settings: { ...DEFAULT_SETTINGS },
  attempts: [],
  journal: [],
  updatedAt: new Date(0).toISOString(),
})

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return blank()
    const saved = JSON.parse(raw)
    return {
      ...blank(),
      ...saved,
      settings: { ...DEFAULT_SETTINGS, ...(saved.settings || {}) },
    }
  } catch {
    return blank()
  }
}

function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* 無痕模式或空間不足：不影響遊戲進行 */
  }
}

const AppCtx = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(load)
  const [sync, setSync] = useState({ status: isCloudEnabled ? 'idle' : 'off', at: null, error: null })
  const pushTimer = useRef(null)
  const pendingRows = useRef({ journal: [], attempts: [] })

  // 本機永遠先寫入，雲端失敗也不會弄丟資料
  useEffect(() => { save(state) }, [state])

  // ---- 低感官負荷 / 動畫開關掛到 <html> 上 ----
  useEffect(() => {
    const on = state.settings.lowSensory || !state.settings.motion
    document.documentElement.classList.toggle('reduce-motion', on)
  }, [state.settings.lowSensory, state.settings.motion])

  const update = useCallback((fn) => {
    setState((prev) => {
      const next = typeof fn === 'function' ? fn(prev) : { ...prev, ...fn }
      return { ...next, updatedAt: new Date().toISOString() }
    })
  }, [])

  // ---------------- 雲端同步 ----------------
  const flush = useCallback(async (snapshot) => {
    if (!isCloudEnabled) return
    setSync((s) => ({ ...s, status: 'syncing' }))
    try {
      const { profileId, childName, stars, stickers, settings, updatedAt } = snapshot
      const { error: e1 } = await supabase.from('knowmood_state').upsert(
        {
          profile_id: profileId,
          child_name: childName || null,
          stars,
          stickers,
          settings,
          updated_at: updatedAt,
        },
        { onConflict: 'profile_id' },
      )
      if (e1) throw e1

      const j = pendingRows.current.journal
      if (j.length) {
        const { error } = await supabase.from('knowmood_journal').upsert(j, { onConflict: 'id' })
        if (error) throw error
        pendingRows.current.journal = []
      }
      const a = pendingRows.current.attempts
      if (a.length) {
        const { error } = await supabase.from('knowmood_attempts').upsert(a, { onConflict: 'id' })
        if (error) throw error
        pendingRows.current.attempts = []
      }
      setSync({ status: 'ok', at: new Date().toISOString(), error: null })
    } catch (err) {
      setSync({ status: 'error', at: new Date().toISOString(), error: err.message || String(err) })
    }
  }, [])

  const queuePush = useCallback(
    (snapshot) => {
      if (!isCloudEnabled) return
      clearTimeout(pushTimer.current)
      pushTimer.current = setTimeout(() => flush(snapshot), 1500)
    },
    [flush],
  )

  useEffect(() => {
    if (!isCloudEnabled) return
    queuePush(state)
    return () => clearTimeout(pushTimer.current)
  }, [state, queuePush])

  // 開啟 App 時先把雲端資料拉下來合併（換裝置也看得到紀錄）
  useEffect(() => {
    if (!isCloudEnabled) return
    let cancelled = false
    ;(async () => {
      setSync((s) => ({ ...s, status: 'syncing' }))
      try {
        const pid = state.profileId
        const [row, journal, attempts] = await Promise.all([
          supabase.from('knowmood_state').select('*').eq('profile_id', pid).maybeSingle(),
          supabase.from('knowmood_journal').select('*').eq('profile_id', pid).order('entry_date', { ascending: false }).limit(400),
          supabase.from('knowmood_attempts').select('*').eq('profile_id', pid).order('created_at', { ascending: false }).limit(MAX_ATTEMPTS),
        ])
        if (cancelled) return
        if (row.error) throw row.error

        setState((prev) => {
          const remote = row.data
          const remoteNewer = remote && new Date(remote.updated_at) > new Date(prev.updatedAt)
          const mergeById = (local, incoming, map) => {
            const byId = new Map(local.map((x) => [x.id, x]))
            ;(incoming || []).forEach((r) => { if (!byId.has(r.id)) byId.set(r.id, map(r)) })
            return [...byId.values()]
          }
          return {
            ...prev,
            stars: remoteNewer ? remote.stars ?? prev.stars : prev.stars,
            stickers: remoteNewer ? remote.stickers ?? prev.stickers : prev.stickers,
            childName: remoteNewer ? remote.child_name ?? prev.childName : prev.childName,
            settings: remoteNewer ? { ...DEFAULT_SETTINGS, ...(remote.settings || {}) } : prev.settings,
            journal: mergeById(prev.journal, journal.data, (r) => ({
              id: r.id, date: r.entry_date, event: r.event_text, emotionId: r.emotion_id,
              intensity: r.intensity, note: r.note || '', ts: r.created_at,
            })).sort((a, b) => (a.date < b.date ? 1 : -1)),
            attempts: mergeById(prev.attempts, attempts.data, (r) => ({
              id: r.id, ts: r.created_at, mode: r.mode, emotionId: r.emotion_id,
              correct: r.correct, tries: r.tries,
            })).slice(0, MAX_ATTEMPTS),
          }
        })
        setSync({ status: 'ok', at: new Date().toISOString(), error: null })
      } catch (err) {
        if (!cancelled) setSync({ status: 'error', at: new Date().toISOString(), error: err.message || String(err) })
      }
    })()
    return () => { cancelled = true }
    // 只在開啟 App 時跑一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------------- 對外的動作 ----------------
  const api = useMemo(
    () => ({
      setSettings: (patch) =>
        update((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } })),

      setChildName: (childName) => update({ childName }),

      addStars: (n = 1) => update((prev) => ({ ...prev, stars: prev.stars + n })),

      claimSticker: (id) =>
        update((prev) =>
          prev.stickers.includes(id) ? prev : { ...prev, stickers: [...prev.stickers, id] },
        ),

      recordAttempt: ({ mode, emotionId, correct, tries = 1 }) => {
        const row = { id: uid(), ts: new Date().toISOString(), mode, emotionId, correct, tries }
        pendingRows.current.attempts.push({
          id: row.id, profile_id: state.profileId, mode, emotion_id: emotionId,
          correct, tries, created_at: row.ts,
        })
        update((prev) => ({ ...prev, attempts: [row, ...prev.attempts].slice(0, MAX_ATTEMPTS) }))
      },

      addJournal: ({ date, event, emotionId, intensity, note = '' }) => {
        const row = { id: uid(), date, event, emotionId, intensity, note, ts: new Date().toISOString() }
        pendingRows.current.journal.push({
          id: row.id, profile_id: state.profileId, entry_date: date, event_text: event,
          emotion_id: emotionId, intensity, note, created_at: row.ts,
        })
        update((prev) => ({ ...prev, journal: [row, ...prev.journal] }))
        return row
      },

      removeJournal: async (id) => {
        update((prev) => ({ ...prev, journal: prev.journal.filter((j) => j.id !== id) }))
        pendingRows.current.journal = pendingRows.current.journal.filter((j) => j.id !== id)
        if (isCloudEnabled) {
          try { await supabase.from('knowmood_journal').delete().eq('id', id) } catch { /* 下次同步再說 */ }
        }
      },

      syncNow: () => flush(state),

      resetProgress: () =>
        update((prev) => ({ ...prev, stars: 0, stickers: [], attempts: [], journal: [] })),

      exportJSON: () => JSON.stringify(state, null, 2),
    }),
    [update, flush, state],
  )

  const value = useMemo(
    () => ({ state, settings: state.settings, sync, cloud: isCloudEnabled, ...api }),
    [state, sync, api],
  )

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp 必須放在 <AppProvider> 裡面')
  return ctx
}
