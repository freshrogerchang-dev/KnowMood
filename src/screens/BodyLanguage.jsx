import { useEffect, useMemo, useState } from 'react'
import { Screen, ProgressDots, SpeakButton, BigButton } from '../components/UI'
import Icon from '../components/Icon'
import RoundEnd from '../components/RoundEnd'
import EmotionFace from '../components/EmotionFace'
import Ruby from '../components/Ruby'
import { activeEmotions } from '../data/emotions'
import { reactionsOf } from '../data/reactions'
import { useApp } from '../lib/store'
import { speakSmart as speak } from '../lib/speech'
import { sfx } from '../lib/sound'
import { buildRound, buildChoices, sample } from '../lib/quiz'

// 動作猜心情
//
// 跟「情緒在哪裡？」方向相反：那邊是「這個情緒身體會做什麼」（一對多，
// 從情緒找動作），這裡是反過來「看到一個動作，猜是什麼心情」（多對一）。
// 這才是真實社交情境會用到的方向 —— 別人不會先講出他的心情，
// 只會露出一個動作，孩子要練的是「讀懂」而不是「認得」。
export default function BodyLanguage({ go }) {
  const { settings, addStars, recordAttempt } = useApp()
  const pool = useMemo(() => activeEmotions(settings), [settings])
  const len = settings.roundLength

  const [seed, setSeed] = useState(0)
  const round = useMemo(() => buildRound(pool, len), [pool, len, seed])
  const [qi, setQi] = useState(0)
  const [wrong, setWrong] = useState([])
  const [solved, setSolved] = useState(false)
  const [earned, setEarned] = useState(0)
  const [done, setDone] = useState(false)

  const answer = round[qi]
  const clue = useMemo(
    () => (answer ? sample(reactionsOf(answer.id), 1)[0] : null),
    [answer, qi, seed], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const choices = useMemo(
    () => (answer ? buildChoices(answer, pool, settings.choices) : []),
    [answer, pool, settings.choices, qi, seed], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const prompt = clue ? `${clue.text}，這是什麼心情？` : ''

  useEffect(() => {
    if (done || !clue) return
    const t = setTimeout(() => speak(prompt, settings), 300)
    return () => clearTimeout(t)
  }, [qi, done]) // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (c) => {
    if (solved) return
    if (c.id === answer.id) {
      setSolved(true)
      sfx.correct(settings)
      const first = wrong.length === 0
      if (first) { addStars(1); setEarned((n) => n + 1) }
      recordAttempt({ mode: 'bodylang', emotionId: answer.id, correct: first, tries: wrong.length + 1 })
      speak(`對了！這是${answer.name}的動作。`, settings)
    } else {
      sfx.retry(settings)
      setWrong((w) => [...w, c.id])
      speak('再看一次這個動作，猜猜看是什麼心情。', settings)
    }
  }

  const next = () => {
    if (qi + 1 >= len) setDone(true)
    else { setQi((n) => n + 1); setWrong([]); setSolved(false) }
  }

  const restart = () => {
    setSeed((s) => s + 1); setQi(0); setWrong([]); setSolved(false); setEarned(0); setDone(false)
  }

  if (done || !answer || !clue) {
    return (
      <Screen title="動作猜心情" onBack={() => go('home')}>
        <RoundEnd earned={earned} total={len} onAgain={restart} onHome={() => go('home')} onRewards={() => go('rewards')} />
      </Screen>
    )
  }

  const hint = wrong.length >= 2

  return (
    <Screen title="動作猜心情" onBack={() => go('home')}>
      <ProgressDots total={len} done={qi} />

      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-2">
        <div className="card w-full max-w-3xl p-6 flex items-center gap-4" style={{ '--edge': '#5C9E76' }}>
          <Icon name={clue.icon} size={64} color="#5C9E76" className="shrink-0" />
          <p className="flex-1 text-2xl md:text-3xl font-bold text-center">{clue.text}</p>
          <SpeakButton text={prompt} className="w-[56px] h-[56px] min-w-0 min-h-0 text-2xl shrink-0" />
        </div>

        {!solved && <h2 className="text-3xl font-bold">這是什麼心情？</h2>}

        {solved ? (
          <div className="flex flex-col items-center gap-3 animate-popIn">
            <EmotionFace emotion={answer} size={160} animate />
            <p className="text-4xl font-bold" style={{ color: answer.color }}>
              <Ruby text={answer.name} zhuyin={answer.zhuyin} show={settings.zhuyin} />
            </p>
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
                  <EmotionFace emotion={c} size={140} className="w-full h-auto max-w-[140px]" />
                  <span className="text-2xl font-bold" style={{ color: c.color }}>
                    <Ruby text={c.name} zhuyin={c.zhuyin} show={settings.zhuyin} />
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {wrong.length > 0 && !solved && (
          <p className="text-xl text-inkSoft flex items-center justify-center gap-1">沒關係，再看看動作<Icon name="thumbsUp" size={20} /></p>
        )}
      </div>
    </Screen>
  )
}
