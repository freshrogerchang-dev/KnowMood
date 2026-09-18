import { useEffect, useMemo, useState } from 'react'
import { Screen, BigButton } from '../components/UI'
import Icon from '../components/Icon'
import ScenarioIcon from '../components/ScenarioIcon'
import { STICKERS, nextSticker } from '../data/stickers'
import { useApp } from '../lib/store'
import { speakSmart as speak } from '../lib/speech'
import { sfx } from '../lib/sound'

export default function Rewards({ go }) {
  const { state, settings, claimSticker } = useApp()
  const [justGot, setJustGot] = useState(null)

  // 星星數達標就自動獲得貼紙，孩子不用再學一套「兌換」規則
  const newly = useMemo(
    () => STICKERS.filter((s) => state.stars >= s.cost && !state.stickers.includes(s.id)),
    [state.stars, state.stickers],
  )

  useEffect(() => {
    if (!newly.length) return
    newly.forEach((s) => claimSticker(s.id))
    setJustGot(newly[newly.length - 1])
    sfx.star(settings)
    speak(`恭喜！你得到新貼紙：${newly[newly.length - 1].name}！`, settings)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newly.length])

  const next = nextSticker(state.stars, state.stickers)
  const owned = new Set(state.stickers)
  // 星星貼紙沒有專屬插畫，用回 Icon 的線條版本 —— 預設是純黑線條，
  // 這裡讓它跟畫面上其他地方的星星一樣是金色
  const stickerColor = (icon) => (icon === 'star' ? '#D8AE57' : undefined)

  return (
    <Screen title="我的貼紙簿" onBack={() => go('home')}>
      <div className="flex-1 flex flex-col items-center gap-4 w-full max-w-3xl mx-auto">
        {justGot && (
          <div className="card p-4 w-full flex items-center gap-4 animate-popIn" style={{ borderColor: '#F3C14F', '--edge': '#F3C14F'}}>
            <ScenarioIcon name={justGot.icon} size={64} className="animate-floatY shrink-0" color={stickerColor(justGot.icon)} />
            <div className="flex-1">
              <p className="text-2xl font-bold">得到新貼紙：{justGot.name}！</p>
              <p className="text-lg text-inkSoft">繼續玩遊戲就可以收集更多喔</p>
            </div>
            <button type="button" onClick={() => setJustGot(null)} className="tap w-[56px] h-[56px] min-w-0 min-h-0 flex items-center justify-center" aria-label="關閉"><Icon name="close" size={24} /></button>
          </div>
        )}

        <div className="flex items-center gap-3 text-4xl font-bold">
          <Icon name="star" size={40} color="#D8AE57" />
          <span className="tabular-nums">{state.stars}</span>
          <span className="text-2xl text-inkSoft font-normal">顆星星</span>
        </div>

        {next && (
          <div className="w-full card p-4">
            <div className="flex items-center justify-between text-xl mb-2">
              <span>下一張貼紙</span>
              <span className="font-bold flex items-center gap-1">
                <ScenarioIcon name={next.icon} size={32} color={stickerColor(next.icon)} />
                {next.name}
              </span>
            </div>
            <div className="h-6 rounded-full bg-line overflow-hidden">
              <div
                className="h-full bg-happy transition-all duration-500"
                style={{ width: `${Math.min(100, (state.stars / next.cost) * 100)}%` }}
              />
            </div>
            <p className="text-lg text-inkSoft mt-2 text-center">
              還差 {Math.max(0, next.cost - state.stars)} 顆星星
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 w-full">
          {STICKERS.map((s) => {
            const has = owned.has(s.id) || state.stars >= s.cost
            return (
              <div
                key={s.id}
                className={`card p-3 flex flex-col items-center gap-1 ${has ? '' : 'opacity-45'}`}
                style={has ? { borderColor: '#F3C14F', '--edge': '#F3C14F'} : undefined}
              >
                {has ? (
                  <ScenarioIcon name={s.icon} size={44} color={stickerColor(s.icon)} />
                ) : (
                  <Icon name="question" size={44} />
                )}
                <span className="text-base font-bold text-center flex items-center gap-0.5">
                  {has ? s.name : <>{s.cost}<Icon name="star" size={16} color="#D8AE57" /></>}
                </span>
              </div>
            )
          })}
        </div>

        <BigButton onClick={() => go('home')} color="#F3C14F"><Icon name="home" size={26} />回家</BigButton>
      </div>
    </Screen>
  )
}
