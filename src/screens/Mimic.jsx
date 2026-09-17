import { useEffect, useMemo, useState } from 'react'
import { Screen, SpeakButton, BigButton, HoldToEnter } from '../components/UI'
import EmotionFace from '../components/EmotionFace'
import Ruby from '../components/Ruby'
import { activeEmotions } from '../data/emotions'
import { useApp } from '../lib/store'
import { speak } from '../lib/speech'
import { sfx } from '../lib/sound'
import { randomOf } from '../lib/quiz'

// 把表情拆成三個部位，一步一步模仿 —— 對 ASD 孩子來說，
// 「把臉當成一整張圖」很難，拆成眉毛 / 眼睛 / 嘴巴就變成可執行的步驟。
const BROW_STEP = {
  happy: '眉毛輕輕往上彎',
  sad: '眉毛中間抬高高',
  angry: '眉毛用力往中間擠',
  scared: '眉毛抬得高高的',
  up: '眉毛抬得高高的',
  flat: '眉毛放輕鬆',
  droop: '眉毛垂下來',
}
const EYE_STEP = {
  arc: '眼睛瞇成彎彎的月亮',
  open: '眼睛張開看前面',
  wide: '眼睛睜得好大好大',
  narrow: '眼睛瞇起來一點點',
  closed: '眼睛輕輕閉起來',
  half: '眼睛半開半閉，快睡著了',
  down: '眼睛看下面',
}
const MOUTH_STEP = {
  openSmile: '嘴巴張開大大的笑',
  smile: '嘴角往上翹',
  slight: '嘴角微微上揚',
  frown: '嘴角往下彎',
  wave: '嘴巴抿成波浪形',
  o: '嘴巴張成圓圓的「喔」',
  smallO: '嘴巴張開小小的',
  line: '嘴巴放鬆閉起來',
}

export default function Mimic({ go }) {
  const { settings, addStars, recordAttempt } = useApp()
  const pool = useMemo(() => activeEmotions(settings), [settings])
  const [target, setTarget] = useState(() => randomOf(pool))
  const [step, setStep] = useState(0)
  const [cheer, setCheer] = useState(false)

  const steps = useMemo(
    () => [
      { icon: '〰️', label: '眉毛', text: BROW_STEP[target.face.brow] || '眉毛放輕鬆' },
      { icon: '👀', label: '眼睛', text: EYE_STEP[target.face.eye] || '眼睛張開看前面' },
      { icon: '👄', label: '嘴巴', text: MOUTH_STEP[target.face.mouth] || '嘴巴放鬆' },
    ],
    [target],
  )

  useEffect(() => {
    setStep(0)
    setCheer(false)
    const t = setTimeout(() => speak(`我們來做「${target.name}」的表情。`, settings), 300)
    return () => clearTimeout(t)
  }, [target.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const sayStep = (i) => {
    setStep(i)
    speak(steps[i].text, settings)
  }

  const succeed = () => {
    sfx.star(settings)
    addStars(1)
    recordAttempt({ mode: 'mimic', emotionId: target.id, correct: true, tries: 1 })
    speak(`你做到了！這就是${target.name}的表情，好棒！`, settings)
    setCheer(true)
  }

  const another = () => {
    sfx.tap(settings)
    let n = randomOf(pool)
    if (pool.length > 1) while (n.id === target.id) n = randomOf(pool)
    setTarget(n)
  }

  return (
    <Screen title="表情模仿" onBack={() => go('home')}>
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        {cheer ? (
          <div className="flex flex-col items-center gap-4 animate-popIn text-center">
            <div className="text-7xl" aria-hidden="true">🌟</div>
            <h2 className="text-4xl font-bold">你做到了！</h2>
            <EmotionFace emotion={target} size={190} animate />
            <p className="text-2xl text-inkSoft">拿到 1 顆星星</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <BigButton onClick={another} color="#6FC2C0">🔁 換一個表情</BigButton>
              <BigButton onClick={() => go('rewards')} color="#A99BD4">🎁 貼紙簿</BigButton>
              <BigButton onClick={() => go('home')} color="#F3C14F">🏠 回家</BigButton>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                做出「
                <span style={{ color: target.color }}>
                  <Ruby text={target.name} zhuyin={target.zhuyin} show={settings.zhuyin} />
                </span>
                」的表情
              </h2>
              <SpeakButton text={`做出${target.name}的表情`} className="w-[56px] h-[56px] min-w-0 min-h-0 text-2xl" />
            </div>

            <EmotionFace emotion={target} size={220} animate className="max-w-[45vw] h-auto" />

            <div className="grid grid-cols-3 gap-2 md:gap-3 w-full max-w-3xl">
              {steps.map((s, i) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => sayStep(i)}
                  className={`tap card p-3 flex flex-col items-center gap-1 text-center ${
                    step === i ? 'ring-4' : 'opacity-80'
                  }`}
                  style={{ borderColor: target.color, '--edge': target.color, '--tw-ring-color': `${target.color}66` }}
                >
                  <span className="text-3xl" aria-hidden="true">{s.icon}</span>
                  <span className="text-sm text-inkSoft">{s.label}</span>
                  <span className="text-lg md:text-xl font-bold leading-snug">{s.text}</span>
                </button>
              ))}
            </div>

            <p className="text-lg text-inkSoft text-center max-w-xl">
              🪞 可以拿鏡子照照看，或是跟旁邊的大人面對面一起做。
            </p>

            <div className="flex flex-wrap gap-3 justify-center items-center">
              <HoldToEnter onDone={succeed} seconds={1.2} className="text-2xl font-bold" >
                ✅ 做到了！（長按）
              </HoldToEnter>
              <BigButton onClick={another} color="#B7AFA4" className="text-xl">🔁 換一個</BigButton>
            </div>
          </>
        )}
      </div>
    </Screen>
  )
}
