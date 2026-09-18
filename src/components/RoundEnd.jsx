import { useEffect } from 'react'
import { useApp } from '../lib/store'
import { speakSmart as speak } from '../lib/speech'
import { sfx } from '../lib/sound'
import { BigButton } from './UI'
import Icon from './Icon'
import { nextSticker } from '../data/stickers'

/** 一輪結束：只講做到了什麼，不強調答錯幾題 */
export default function RoundEnd({ earned, total, onAgain, onHome, onRewards }) {
  const { state, settings } = useApp()
  const next = nextSticker(state.stars, state.stickers)

  useEffect(() => {
    sfx.star(settings)
    speak(`太棒了！你完成了${total}題，拿到${earned}顆星星。`, settings)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center animate-popIn">
      <Icon name="celebrate" size={72} color="#E8A33D" tint="#FBEFCF" />
      <h2 className="text-4xl font-bold">你完成了！</h2>
      <div className="flex items-center gap-2 text-5xl font-bold">
        <Icon name="star" size={44} color="#D8AE57" />
        <span className="tabular-nums">+{earned}</span>
      </div>
      <p className="text-xl text-inkSoft">
        總共 {total} 題　目前有 {state.stars} 顆星星
      </p>
      {next && (
        <p className="text-xl">
          再 <b>{Math.max(0, next.cost - state.stars)}</b> 顆星星就可以拿到
          <span className="text-3xl align-middle mx-1" aria-hidden="true">{next.icon}</span>
          {next.name}！
        </p>
      )}
      <div className="flex flex-wrap gap-3 justify-center">
        <BigButton onClick={onAgain} color="#93C08A"><Icon name="again" size={28} />再玩一次</BigButton>
        {onRewards && <BigButton onClick={onRewards} color="#A99BD4"><Icon name="rewards" size={28} />貼紙簿</BigButton>}
        <BigButton onClick={onHome} color="#F3C14F"><Icon name="home" size={28} />回家</BigButton>
      </div>
    </div>
  )
}
