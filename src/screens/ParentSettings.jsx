import { useMemo, useState } from 'react'
import { Screen } from '../components/UI'
import EmotionFace from '../components/EmotionFace'
import { EMOTIONS, getEmotion } from '../data/emotions'
import { useApp } from '../lib/store'
import { speak } from '../lib/speech'
import { INTENSITY } from './Journal'

function Section({ title, children, note }) {
  return (
    <section className="card p-4 w-full">
      <h2 className="text-xl font-bold mb-1">{title}</h2>
      {note && <p className="text-sm text-inkSoft mb-3">{note}</p>}
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Toggle({ label, value, onChange, note }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <span>
        <span className="text-lg">{label}</span>
        {note && <span className="block text-sm text-inkSoft">{note}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className={`w-[64px] h-[36px] rounded-full border-2 shrink-0 transition-colors ${value ? 'bg-calm border-calm' : 'bg-line border-line'}`}
      >
        <span className={`block w-[28px] h-[28px] bg-paper rounded-full transition-transform ${value ? 'translate-x-[32px]' : 'translate-x-[2px]'}`} />
      </button>
    </label>
  )
}

function Choice({ label, options, value, onChange, note }) {
  return (
    <div>
      <p className="text-lg">{label}</p>
      {note && <p className="text-sm text-inkSoft mb-1">{note}</p>}
      <div className="flex flex-wrap gap-2 mt-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`px-4 py-2 rounded-xl border-2 text-lg ${
              value === o.value ? 'bg-calm/20 border-calm font-bold' : 'border-line bg-paper text-inkSoft'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ParentSettings({ go }) {
  const { state, settings, setSettings, setChildName, sync, cloud, syncNow, resetProgress, exportJSON } = useApp()
  const [confirmReset, setConfirmReset] = useState(false)

  const stats = useMemo(() => {
    const byEmotion = {}
    EMOTIONS.forEach((e) => { byEmotion[e.id] = { n: 0, ok: 0 } })
    state.attempts.forEach((a) => {
      const row = byEmotion[a.emotionId]
      if (!row) return
      row.n += 1
      if (a.correct) row.ok += 1
    })
    const n = state.attempts.length
    const ok = state.attempts.filter((a) => a.correct).length
    const j = state.journal
    const avg = j.length ? (j.reduce((s, x) => s + (x.intensity || 0), 0) / j.length).toFixed(1) : '—'
    const journalByEmotion = {}
    j.forEach((x) => { journalByEmotion[x.emotionId] = (journalByEmotion[x.emotionId] || 0) + 1 })
    return { byEmotion, n, ok, rate: n ? Math.round((ok / n) * 100) : 0, journalCount: j.length, avg, journalByEmotion }
  }, [state.attempts, state.journal])

  const download = () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `knowmood-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleEmotion = (id) => {
    const off = settings.disabledEmotions.includes(id)
    setSettings({
      disabledEmotions: off
        ? settings.disabledEmotions.filter((x) => x !== id)
        : [...settings.disabledEmotions, id],
    })
  }

  const syncText = {
    off: '未設定（資料只存在這台裝置）',
    idle: '準備中',
    syncing: '同步中⋯',
    ok: `已同步 ${sync.at ? new Date(sync.at).toLocaleTimeString('zh-TW') : ''}`,
    error: `同步失敗：${sync.error || ''}`,
  }[sync.status]

  return (
    <Screen title="家長 / 治療師設定" onBack={() => go('home')} right={<span />}>
      <div className="flex-1 overflow-y-auto space-y-4 max-w-3xl w-full mx-auto pb-8">
        <Section title="孩子">
          <label className="block">
            <span className="text-lg">暱稱（只存在本機／你的雲端專案，建議用小名）</span>
            <input
              value={state.childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="例如：小寶"
              className="mt-1 w-full card p-3 text-xl"
            />
          </label>
        </Section>

        <Section title="難度" note="建議從第一階開始，穩定答對 80% 以上再往上調。">
          <Choice
            label="開放的情緒種類"
            value={settings.level}
            onChange={(level) => setSettings({ level })}
            options={[
              { value: 1, label: '第一階：4 種核心' },
              { value: 2, label: '第二階：6 種' },
              { value: 3, label: '第三階：8 種' },
            ]}
          />
          <Choice
            label="每題選項數"
            note="從 2 選 1 開始，成功率高、比較不會挫折。"
            value={settings.choices}
            onChange={(choices) => setSettings({ choices })}
            options={[{ value: 2, label: '2 選 1' }, { value: 3, label: '3 選 1' }, { value: 4, label: '4 選 1' }]}
          />
          <Choice
            label="一輪題數"
            note="注意力較短時選 4 題，做完就有完成感。"
            value={settings.roundLength}
            onChange={(roundLength) => setSettings({ roundLength })}
            options={[{ value: 4, label: '4 題' }, { value: 6, label: '6 題' }, { value: 8, label: '8 題' }]}
          />
        </Section>

        <Section title="要練習的情緒" note="點一下可以暫時關掉某種情緒（例如先不練害怕）。">
          <div className="grid grid-cols-4 gap-2">
            {EMOTIONS.map((e) => {
              const on = !settings.disabledEmotions.includes(e.id) && e.level <= settings.level
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => toggleEmotion(e.id)}
                  disabled={e.level > settings.level}
                  className={`card p-2 flex flex-col items-center gap-1 ${on ? '' : 'opacity-35'}`}
                  style={{ borderColor: e.color, '--edge': e.color}}
                >
                  <EmotionFace emotion={e} size={56} />
                  <span className="text-base font-bold">{e.name}</span>
                  {e.level > settings.level && <span className="text-xs text-inkSoft">第 {e.level} 階</span>}
                </button>
              )
            })}
          </div>
        </Section>

        <Section title="感官與輔助" note="ASD 孩子對聲音、動態特別敏感時，請打開「低感官負荷模式」。">
          <Toggle label="低感官負荷模式" note="關掉所有動畫與音效，畫面保持安靜。"
            value={settings.lowSensory}
            onChange={(lowSensory) => setSettings({ lowSensory, sound: !lowSensory, motion: !lowSensory })} />
          <Toggle label="語音朗讀" note="把題目和情緒名稱唸出來（尚未識字時務必打開）。"
            value={settings.speech} onChange={(speech) => setSettings({ speech })} />
          <div>
            <p className="text-lg">語速：{settings.speechRate.toFixed(2)}</p>
            <input
              type="range" min="0.6" max="1.2" step="0.05" value={settings.speechRate}
              onChange={(e) => setSettings({ speechRate: Number(e.target.value) })}
              onMouseUp={() => speak('我覺得開心', { ...settings, speech: true })}
              onTouchEnd={() => speak('我覺得開心', { ...settings, speech: true })}
              className="w-full h-10 accent-calm"
            />
          </div>
          <Toggle label="音效" value={settings.sound} onChange={(sound) => setSettings({ sound })} />
          <Toggle label="動畫" value={settings.motion} onChange={(motion) => setSettings({ motion })} />
          <Toggle label="情緒名稱加注音" value={settings.zhuyin} onChange={(zhuyin) => setSettings({ zhuyin })} />
          <Toggle
            label="情緒詞彙擴充"
            note="圖鑑多一個「還可以這樣說」分頁（如：舒服→滿足→高興→幸福→興奮），記心情時也會提示更精準的說法。孩子剛開始學時可以先關掉。"
            value={settings.richVocab !== false}
            onChange={(richVocab) => setSettings({ richVocab })}
          />
        </Section>

        <Section title="練習紀錄" note="正確率只計算「第一次就答對」的比例。">
          <div className="flex gap-4 text-center">
            <div className="flex-1 card p-3">
              <p className="text-3xl font-bold tabular-nums">{stats.n}</p>
              <p className="text-sm text-inkSoft">總題數</p>
            </div>
            <div className="flex-1 card p-3">
              <p className="text-3xl font-bold tabular-nums">{stats.rate}%</p>
              <p className="text-sm text-inkSoft">一次答對率</p>
            </div>
            <div className="flex-1 card p-3">
              <p className="text-3xl font-bold tabular-nums">{stats.journalCount}</p>
              <p className="text-sm text-inkSoft">心情紀錄</p>
            </div>
            <div className="flex-1 card p-3">
              <p className="text-3xl font-bold tabular-nums">{stats.avg}</p>
              <p className="text-sm text-inkSoft">平均強度</p>
            </div>
          </div>

          <div className="space-y-2">
            {EMOTIONS.filter((e) => stats.byEmotion[e.id].n > 0).map((e) => {
              const r = stats.byEmotion[e.id]
              const pct = Math.round((r.ok / r.n) * 100)
              return (
                <div key={e.id} className="flex items-center gap-3">
                  <span className="w-16 text-lg" style={{ color: e.color }}>{e.name}</span>
                  <div className="flex-1 h-5 rounded-full bg-line overflow-hidden">
                    <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: e.color }} />
                  </div>
                  <span className="w-24 text-right text-inkSoft tabular-nums">{pct}%（{r.n} 題）</span>
                </div>
              )
            })}
            {stats.n === 0 && <p className="text-inkSoft">還沒有練習紀錄。</p>}
          </div>
        </Section>

        <Section title="最近的心情" note="用來看看孩子最近常出現哪些情緒、強度有多高。">
          {state.journal.length === 0 ? (
            <p className="text-inkSoft">還沒有心情紀錄。</p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {state.journal.slice(0, 20).map((j) => {
                const e = getEmotion(j.emotionId)
                return (
                  <div key={j.id} className="flex items-center gap-2 text-lg">
                    <span className="text-inkSoft text-sm w-24 shrink-0">{j.date}</span>
                    <span className="w-24 shrink-0 truncate" style={{ color: e?.color }}>
                      {j.word || e?.name || '—'}
                    </span>
                    <span className="w-24 shrink-0 text-base text-inkSoft">
                      {INTENSITY[j.intensity - 1]?.label}（{j.intensity}）
                    </span>
                    <span className="flex-1 truncate">{j.event}</span>
                  </div>
                )
              })}
            </div>
          )}
        </Section>

        <Section title="資料與同步">
          <p className="text-lg">
            雲端同步狀態：<b>{syncText}</b>
          </p>
          <p className="text-sm text-inkSoft">
            所有資料都會先存在這台裝置，離線也能玩。
            {cloud
              ? '已設定 Supabase，紀錄會自動同步到你自己的專案。請避免在事件描述中填入真實姓名、學校等個人資料。'
              : '目前未設定 Supabase（.env 沒填），資料僅存在本機。'}
          </p>
          <div className="flex flex-wrap gap-2">
            {cloud && (
              <button type="button" onClick={syncNow} className="px-4 py-3 rounded-xl border-2 border-line bg-paper text-lg">
                ☁️ 立即同步
              </button>
            )}
            <button type="button" onClick={download} className="px-4 py-3 rounded-xl border-2 border-line bg-paper text-lg">
              ⬇️ 匯出紀錄 (JSON)
            </button>
            {confirmReset ? (
              <>
                <button type="button" onClick={() => { resetProgress(); setConfirmReset(false) }}
                  className="px-4 py-3 rounded-xl border-2 border-angry bg-angry/15 text-lg font-bold">
                  確定清除？按這裡
                </button>
                <button type="button" onClick={() => setConfirmReset(false)}
                  className="px-4 py-3 rounded-xl border-2 border-line bg-paper text-lg">取消</button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmReset(true)}
                className="px-4 py-3 rounded-xl border-2 border-line bg-paper text-lg text-inkSoft">
                🗑️ 清除所有紀錄
              </button>
            )}
          </div>
        </Section>
      </div>
    </Screen>
  )
}
