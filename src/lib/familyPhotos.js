// 家人表情相簿 —— 儲存層
//
// ⚠️ 隱私分界線：這裡存的是家人真實的臉。跟 App 其他資料完全不一樣層級的敏感度，
// 所以刻意做成「不管雲端同步有沒有開，這些照片永遠只留在這台裝置上」：
//   - 用單獨的 IndexedDB 資料庫，跟 store.jsx 的 localStorage/Supabase 同步邏輯完全分開
//   - 沒有任何程式碼路徑會把這裡的資料送到 Supabase 或任何伺服器
//   - 名字（暱稱）也存在本機，不做雲端同步，避免牽連到照片
//
// 照片存之前會先用 canvas 縮小到最長邊 480px、轉成 JPEG 品質 0.82，
// 不然一張 iPad 相機拍出來的原始照片可能到 3-5MB，八個情緒 × 幾個家人很快就爆量。

import { useCallback, useEffect, useState } from 'react'

const DB_NAME = 'knowmood-family'
const DB_VERSION = 1
const STORE = 'photos'
const META_KEY = 'knowmood.family.members.v1'

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('no-indexeddb'))
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

const photoKey = (memberId, emotionId) => `${memberId}:${emotionId}`

/** 把使用者選的圖片檔案縮小、壓縮成 Blob，避免佔用太多空間 */
export function resizeImage(file, maxSide = 480, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('toBlob-failed'))),
        'image/jpeg',
        quality,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image-load-failed')) }
    img.src = url
  })
}

export async function savePhoto(memberId, emotionId, blob) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(blob, photoKey(memberId, emotionId))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPhoto(memberId, emotionId) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(photoKey(memberId, emotionId))
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => reject(req.error)
  })
}

export async function deletePhoto(memberId, emotionId) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(photoKey(memberId, emotionId))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** 刪除某個家人時，把他所有情緒的照片一起清掉 */
export async function deleteAllPhotosFor(memberId, emotionIds) {
  await Promise.all(emotionIds.map((e) => deletePhoto(memberId, e).catch(() => {})))
}

/** 列出「哪些 member:emotion 組合有照片」，不把整張圖讀出來，開設定頁時用來畫縮圖狀態 */
export async function listPhotoKeys() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAllKeys()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// ---------------- 家人名單（純本機 metadata，跟照片分開存但邏輯上綁在一起）----------------

const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export function loadMembers() {
  try {
    const raw = localStorage.getItem(META_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveMembers(members) {
  try { localStorage.setItem(META_KEY, JSON.stringify(members)) } catch { /* 空間不足就算了 */ }
}

export function addMember(name) {
  const members = loadMembers()
  const member = { id: uid(), name: name.trim().slice(0, 10) || '家人' }
  const next = [...members, member]
  saveMembers(next)
  return { members: next, member }
}

export function removeMember(id) {
  const next = loadMembers().filter((m) => m.id !== id)
  saveMembers(next)
  return next
}


// ---------------- React hook：給設定頁與遊戲共用 ----------------

export function useFamilyAlbum() {
  const [members, setMembers] = useState(() => loadMembers())
  const [keys, setKeys] = useState(() => new Set())
  const [ready, setReady] = useState(false)

  const refreshKeys = useCallback(async () => {
    try {
      setKeys(new Set(await listPhotoKeys()))
    } catch {
      setKeys(new Set()) // IndexedDB 不支援（例如某些隱私瀏覽模式）就當作沒有照片
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => { refreshKeys() }, [refreshKeys])

  const hasPhoto = useCallback((memberId, emotionId) => keys.has(photoKey(memberId, emotionId)), [keys])

  const addNewMember = useCallback((name) => {
    const { members: next, member } = addMember(name)
    setMembers(next)
    return member
  }, [])

  const removeExistingMember = useCallback(async (id, emotionIds) => {
    await deleteAllPhotosFor(id, emotionIds)
    setMembers(removeMember(id))
    await refreshKeys()
  }, [refreshKeys])

  const setPhotoFor = useCallback(async (memberId, emotionId, file) => {
    const blob = await resizeImage(file)
    await savePhoto(memberId, emotionId, blob)
    await refreshKeys()
  }, [refreshKeys])

  const removePhotoFor = useCallback(async (memberId, emotionId) => {
    await deletePhoto(memberId, emotionId)
    await refreshKeys()
  }, [refreshKeys])

  return {
    ready,
    members,
    hasPhoto,
    addMember: addNewMember,
    removeMember: removeExistingMember,
    setPhoto: setPhotoFor,
    removePhoto: removePhotoFor,
  }
}
