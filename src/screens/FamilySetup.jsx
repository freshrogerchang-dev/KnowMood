import { useRef, useState } from 'react'
import { Screen, BigButton } from '../components/UI'
import Icon from '../components/Icon'
import EmotionFace from '../components/EmotionFace'
import FamilyPhoto from '../components/FamilyPhoto'
import { EMOTIONS } from '../data/emotions'
import { useFamilyAlbum } from '../lib/familyPhotos'

const NAME_CHIPS = ['爸爸', '媽媽', '阿公', '阿嬤', '哥哥', '姊姊', '弟弟', '妹妹', '我自己']

/**
 * 家人表情相簿的設定頁。只有大人看得到（藏在家長設定的長按閘門後面）。
 *
 * ⚠️ 這裡拍的照片「只存在這台裝置上」，不會上傳、不會同步、不會離開裝置 ——
 * 跟 App 其他資料完全不同層級的敏感度，所以刻意不接 Supabase，見 familyPhotos.js。
 */
export default function FamilySetup({ onBack }) {
  const { members, hasPhoto, addMember, removeMember, setPhoto, removePhoto } = useFamilyAlbum()
  const [name, setName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null) // memberId
  const [busySlot, setBusySlot] = useState(null) // `${memberId}:${emotionId}`
  const [error, setError] = useState('')
  const fileInput = useRef(null)
  const pendingSlot = useRef(null)

  const submitAdd = () => {
    if (!name.trim()) return
    addMember(name)
    setName('')
  }

  const openPicker = (memberId, emotionId) => {
    pendingSlot.current = { memberId, emotionId }
    fileInput.current?.click()
  }

  const onFileChosen = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 清空，才能連續選同一張測試檔案
    const slot = pendingSlot.current
    pendingSlot.current = null
    if (!file || !slot) return
    setError('')
    setBusySlot(`${slot.memberId}:${slot.emotionId}`)
    try {
      await setPhoto(slot.memberId, slot.emotionId, file)
    } catch {
      setError('這張照片存不進去，可能是瀏覽器不支援或空間不足，換一張試試看。')
    } finally {
      setBusySlot(null)
    }
  }

  return (
    <Screen title="家人表情相簿" onBack={onBack} backIcon="back" backLabel="返回">
      <div className="flex-1 overflow-y-auto space-y-4 max-w-3xl w-full mx-auto pb-8">
        <div className="card p-4" style={{ '--edge': '#93A88C', backgroundColor: '#EAF1E8' }}>
          <p className="text-lg font-bold mb-1 flex items-center gap-1"><Icon name="lock" size={22} />這些照片只存在這台裝置上</p>
          <p className="text-base leading-relaxed">
            不會上傳、不會同步到雲端、不會傳給任何人 —— 就算你開了雲端同步，
            這裡的照片也不會被送出去。孩子已經認得情緒的臉譜（開心、難過⋯）之後，
            用家人真實的表情練習，有助於把在卡通臉上學到的東西用到真人身上。
          </p>
        </div>

        {error && (
          <div className="card p-3 text-lg flex items-center gap-1" style={{ '--edge': '#E08A6E', backgroundColor: '#FAE7E0' }}>
            <Icon name="warning" size={22} color="#C56A4A" />{error}
          </div>
        )}

        {/* 新增家人 */}
        <section className="card p-4">
          <h2 className="text-xl font-bold mb-2">新增家人</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {NAME_CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setName(c)}
                className="px-3 py-2 rounded-xl border-2 border-line bg-paper text-base"
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitAdd()}
              placeholder="例如：媽媽"
              maxLength={10}
              className="flex-1 card p-3 text-xl"
            />
            <BigButton onClick={submitAdd} color="#93C08A" className="text-lg shrink-0" mute>
              <Icon name="plus" size={22} />新增
            </BigButton>
          </div>
        </section>

        {/* 每個家人的照片格 */}
        {members.length === 0 && (
          <p className="text-center text-lg text-inkSoft py-6">還沒有加入家人，先在上面新增一個吧。</p>
        )}

        {members.map((m) => {
          const emotionIds = EMOTIONS.map((e) => e.id)
          const count = emotionIds.filter((id) => hasPhoto(m.id, id)).length
          return (
            <section key={m.id} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold">
                  {m.name} <span className="text-base text-inkSoft font-normal">已拍 {count}/{EMOTIONS.length}</span>
                </h2>
                {confirmDelete === m.id ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { removeMember(m.id, emotionIds); setConfirmDelete(null) }}
                      className="px-3 py-2 rounded-xl border-2 border-angry bg-angry/15 text-base font-bold"
                    >
                      確定刪除
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(null)}
                      className="px-3 py-2 rounded-xl border-2 border-line bg-paper text-base">取消</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(m.id)}
                    aria-label={`刪除${m.name}`}
                    className="text-inkSoft px-2"
                  >
                    <Icon name="trash" size={26} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {EMOTIONS.map((e) => {
                  const got = hasPhoto(m.id, e.id)
                  const isBusy = busySlot === `${m.id}:${e.id}`
                  return (
                    <div key={e.id} className="flex flex-col items-center gap-1">
                      <div
                        className="relative w-full aspect-square rounded-2xl border-2 overflow-hidden flex items-center justify-center bg-paper"
                        style={{ borderColor: got ? e.color : '#E8E0D4' }}
                      >
                        {isBusy ? (
                          <span className="text-sm text-inkSoft">處理中…</span>
                        ) : got ? (
                          <FamilyPhoto memberId={m.id} emotionId={e.id} alt={`${m.name}的${e.name}表情`}
                            className="w-full h-full object-cover" />
                        ) : (
                          <button
                            type="button"
                            aria-label={`拍${m.name}的${e.name}表情`}
                            onClick={() => openPicker(m.id, e.id)}
                            className="tap min-h-0 min-w-0 w-full h-full flex flex-col items-center justify-center gap-1"
                          >
                            <EmotionFace emotion={e} size={32} className="opacity-40" />
                            <Icon name="camera" size={26} />
                          </button>
                        )}
                      </div>
                      <span className="text-sm font-bold" style={{ color: got ? e.color : undefined }}>{e.name}</span>
                      {got && (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => openPicker(m.id, e.id)}
                            className="text-xs text-inkSoft underline">重拍</button>
                          <button type="button" onClick={() => removePhoto(m.id, e.id)}
                            className="text-xs text-inkSoft underline">刪除</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {/* 共用的隱藏檔案輸入：不加 capture，讓瀏覽器同時提供「拍照」與「相簿選取」 */}
      <input ref={fileInput} type="file" accept="image/*" onChange={onFileChosen} className="hidden" />
    </Screen>
  )
}
