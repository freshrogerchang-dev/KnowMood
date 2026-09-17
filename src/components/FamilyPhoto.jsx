import { useEffect, useState } from 'react'
import { getPhoto } from '../lib/familyPhotos'

/**
 * 顯示一張存在 IndexedDB 裡的家人照片。
 * Blob 沒辦法直接當 <img src>，要先轉成 object URL，用完要記得 revoke 避免記憶體累積。
 */
export default function FamilyPhoto({ memberId, emotionId, alt = '', className = '' }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    let cancelled = false
    let created = null
    setUrl(null)
    getPhoto(memberId, emotionId)
      .then((blob) => {
        if (cancelled) return
        if (blob) {
          created = URL.createObjectURL(blob)
          setUrl(created)
        }
      })
      .catch(() => { /* 讀不到就顯示空白，不讓整頁壞掉 */ })
    return () => {
      cancelled = true
      if (created) URL.revokeObjectURL(created)
    }
  }, [memberId, emotionId])

  if (!url) return <div className={className} aria-hidden="true" />
  return <img src={url} alt={alt} className={className} />
}
