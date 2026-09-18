import { useCallback, useEffect, useMemo, useState } from 'react'
import { Screen, ProgressDots, SpeakButton, BigButton } from '../components/UI'
import Icon from '../components/Icon'
import ScenarioIcon from '../components/ScenarioIcon'
import RoundEnd from '../components/RoundEnd'
import EmotionFace from '../components/EmotionFace'
import Ruby from '../components/Ruby'
import { activeEmotions, getEmotion } from '../data/emotions'
import { scenariosFor } from '../data/scenarios'
import { useApp } from '../lib/store'
import { speak } from '../lib/speech'
import { sfx } from '../lib/sound'
import { buildChoices, shuffle } from '../lib/quiz'

export default function Scenario({ go }) {
  const { settings, addStars, recordAttempt } = useApp()
  const pool = useMemo(() => activeEmotions(settings), [settings])
  const len = settings.roundLength

  const [seed, setSeed] = useState(0)
  const round = useMemo(() => {
    const bank = scenariosFor(pool.map((e) => e.id))
    const picked = shuffle(bank).slice(0, len)
    // 題庫不夠時就重複抽，確保一輪的長度固定
    while (picked.length < len && bank.length) picked.push(bank[picked.length % bank.length])
    return picked
  }, [pool, len, seed])

  const [qi, setQi] = useState(0)
  const [wrong, setWrong] = useState([])
  const [solved, setSolved] = useState(false)
  const [earned, setEarned] = useState(0)
  const [done, setDone] = useState(false)

  const q = round[qi]
  const answer = getEmotion(q?.emotionId)
  const choices = useMemo(
    () => (answer ? buildChoices(answer, pool, settings.choices) : []),
    [answer, pool, settings.choices, qi, seed], // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    if (done || !q) return
    const t = setTimeout(() => speak(`${q.text} 他現在是什麼心情？`, settings), 250)
    return () => clearTimeout(t)
  }, [qi, done]) // eslint-disable-line react-hooks/exhaustive-deps

  const next = useCallback(() => {
    if (qi + 1 >= len) setDone(true)
    else { setQi((n) => n + 1); setWrong([]); setSolved(false) }
  }, [qi, len])

  const pick = (c) => {
    if (solved) return
    if (c.id === answer.id) {
      setSolved(true)
      sfx.correct(settings)
      const first = wrong.length === 0
      if (first) { addStars(1); setEarned((n) => n + 1) }
      recordAttempt({ mode: 'scenario', emotionId: answer.id, correct: first, tries: wrong.length + 1 })
      speak(`對！他覺得${answer.name}。${q.because}`, settings)
    } else {
      sfx.retry(settings)
      setWrong((w) => [...w, c.id])
      speak('再想一想，他會有什麼感覺呢？', settings)
    }
  }

  const restart = () => {
    setSeed((s) => s + 1); setQi(0); setWrong([]); setSolved(false); setEarned(0); setDone(false)
  }

  if (done || !q) {
    return (
      <Screen title="情境猜猜看" onBack={() => go('home')}>
        <RoundEnd earned={earned} total={len} onAgain={restart} onHome={() => go('home')} onRewards={() => go('rewards')} />
      </Screen>
    )
  }

  const hint = wrong.length >= 2

  return (
    <Screen title="情境猜猜看" onBack={() => go('home')}>
      <ProgressDots total={len} done={qi} />

      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-2">
        {/* 情境卡 */}
        <div className="card w-full max-w-3xl p-5 flex items-center gap-4">
          <ScenarioIcon name={q.icon} size={80} className="w-20 md:w-24 h-auto shrink-0 animate-floatY" />
          <p className="flex-1 text-2xl md:text-3xl leading-relaxed">{q.text}</p>
          <SpeakButton text={q.text} className="w-[64px] h-[64px] min-w-0 min-h-0 text-3xl shrink-0" />
        </div>

        {!solved && <h2 className="text-3xl font-bold">他現在是什麼心情？</h2>}

        {solved ? (
          <div className="flex flex-col items-center gap-3 animate-popIn">
            <EmotionFace emotion={answer} size={170} animate />
            <p className="text-4xl font-bold" style={{ color: answer.color }}>
              <Ruby text={answer.name} zhuyin={answer.zhuyin} show={settings.zhuyin} />
            </p>
            <div className="card p-4 max-w-2xl text-2xl leading-relaxed flex items-center gap-3">
              <p className="flex-1">{q.because}</p>
              <SpeakButton text={q.because} className="w-[56px] h-[56px] min-w-0 min-h-0 text-2xl shrink-0" />
            </div>
            <BigButton onClick={next} color="#93C08A">
              {qi + 1 >= len ? <>看看拿到幾顆星星<Icon name="star" size={26} color="#D8AE57" /></> : '下一題 ▶'}
            </BigButton>
          </div>
        ) : (
          <div className={`grid gap-3 w-full max-w-4xl ${choices.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
            {choices.map((c) => {
              const isWrong = wrong.includes(c.id)
              const hinted = hint && c.id === answer.id
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={isWrong}
                  aria-label={c.name}
                  onClick={() => pick(c)}
                  className={`tap card p-3 flex flex-col items-center gap-1 transition-all duration-300
                    ${isWrong ? 'opacity-25 grayscale' : ''} ${hinted ? 'animate-floatY ring-4' : ''}`}
                  style={{ borderColor: c.color, '--edge': c.color, '--tw-ring-color': `${c.color}66` }}
                >
                  <EmotionFace emotion={c} size={160} className="w-full h-auto max-w-[160px]" />
                  <span className="text-3xl font-bold" style={{ color: c.color }}>
                    <Ruby text={c.name} zhuyin={c.zhuyin} show={settings.zhuyin} />
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {wrong.length > 0 && !solved && <p className="text-xl text-inkSoft flex items-center justify-center gap-1">沒關係，再想想看<Icon name="thumbsUp" size={20} /></p>}
      </div>
    </Screen>
  )
}
