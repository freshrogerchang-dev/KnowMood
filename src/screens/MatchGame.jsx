import { useCallback, useEffect, useMemo, useState } from 'react'
import { Screen, ProgressDots, SpeakButton } from '../components/UI'
import Icon from '../components/Icon'
import RoundEnd from '../components/RoundEnd'
import EmotionFace from '../components/EmotionFace'
import Ruby from '../components/Ruby'
import { activeEmotions } from '../data/emotions'
import { useApp } from '../lib/store'
import { speak } from '../lib/speech'
import { sfx } from '../lib/sound'
import { buildRound, buildChoices } from '../lib/quiz'

// 無錯誤學習（errorless learning）：答錯不會失敗、不會扣分、不會換題，
// 只是把那個選項變淡，並在第二次嘗試後把正確答案輕輕標出來。
export default function MatchGame({ go }) {
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
  // 偶數題：聽名字找表情；奇數題：看表情找名字。順序固定，孩子才能預期。
  const nameToFace = qi % 2 === 0
  const choices = useMemo(() => buildChoices(answer, pool, settings.choices), [answer, pool, settings.choices, qi, seed]) // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = nameToFace ? `哪一個是「${answer.name}」？` : '他現在是什麼心情？'

  useEffect(() => {
    if (done) return
    const t = setTimeout(() => speak(prompt, settings), 250)
    return () => clearTimeout(t)
  }, [qi, done]) // eslint-disable-line react-hooks/exhaustive-deps

  const pick = useCallback(
    (choice) => {
      if (solved) return
      if (choice.id === answer.id) {
        setSolved(true)
        sfx.correct(settings)
        const first = wrong.length === 0
        if (first) { addStars(1); setEarned((n) => n + 1) }
        recordAttempt({ mode: 'match', emotionId: answer.id, correct: first, tries: wrong.length + 1 })
        speak(`答對了！這是${answer.name}。`, settings)
        setTimeout(() => {
          if (qi + 1 >= len) setDone(true)
          else { setQi((n) => n + 1); setWrong([]); setSolved(false) }
        }, 1700)
      } else {
        sfx.retry(settings)
        setWrong((w) => [...w, choice.id])
        speak('再試試看，我幫你留下來了。', settings)
      }
    },
    [answer, solved, wrong, qi, len, settings], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const restart = () => {
    setSeed((s) => s + 1); setQi(0); setWrong([]); setSolved(false); setEarned(0); setDone(false)
  }

  if (done) {
    return (
      <Screen title="配對遊戲" onBack={() => go('home')}>
        <RoundEnd earned={earned} total={len} onAgain={restart} onHome={() => go('home')} onRewards={() => go('rewards')} />
      </Screen>
    )
  }

  // 嘗試兩次以上就把正確答案輕輕提示出來，不讓孩子卡住
  const hint = wrong.length >= 2

  return (
    <Screen title="配對遊戲" onBack={() => go('home')}>
      <ProgressDots total={len} done={qi} />

      <div className="flex-1 flex flex-col items-center justify-center gap-5 py-3">
        <div className="flex items-center gap-4">
          {nameToFace ? (
            <h2 className="text-4xl md:text-5xl font-bold text-center">
              哪一個是
              <span style={{ color: answer.color }}>
                「<Ruby text={answer.name} zhuyin={answer.zhuyin} show={settings.zhuyin} />」
              </span>
              ？
            </h2>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <EmotionFace emotion={answer} size={200} animate className="max-w-[45vw] h-auto" />
              <h2 className="text-3xl md:text-4xl font-bold">他現在是什麼心情？</h2>
            </div>
          )}
          <SpeakButton text={prompt} className="w-[64px] h-[64px] min-w-0 min-h-0 text-3xl shrink-0" />
        </div>

        <div className={`grid gap-3 md:gap-4 w-full max-w-4xl ${choices.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
          {choices.map((c) => {
            const isWrong = wrong.includes(c.id)
            const isRight = solved && c.id === answer.id
            const hinted = hint && c.id === answer.id
            return (
              <button
                key={c.id}
                type="button"
                disabled={isWrong || solved}
                aria-label={c.name}
                onClick={() => pick(c)}
                className={`tap card p-3 flex flex-col items-center gap-1 transition-all duration-300
                  ${isWrong ? 'opacity-25 grayscale' : ''}
                  ${isRight ? 'scale-105 ring-8' : ''}
                  ${hinted && !solved ? 'animate-floatY ring-4' : ''}`}
                style={{
                  borderColor: c.color, '--edge': c.color,
                  '--tw-ring-color': `${c.color}66`,
                  backgroundColor: isRight ? `${c.color}22` : undefined,
                }}
              >
                {nameToFace ? (
                  <EmotionFace emotion={c} size={220} animate={isRight} className="w-full h-auto max-w-[220px]" />
                ) : (
                  <span className="text-3xl md:text-4xl font-bold py-6" style={{ color: c.color }}>
                    <Ruby text={c.name} zhuyin={c.zhuyin} show={settings.zhuyin} />
                  </span>
                )}
                {isRight && <Icon name="check" size={36} color="#5FAE86" />}
              </button>
            )
          })}
        </div>

        {wrong.length > 0 && !solved && (
          <p className="text-xl text-inkSoft flex items-center justify-center gap-1">沒關係，再試一次<Icon name="thumbsUp" size={20} /></p>
        )}
      </div>
    </Screen>
  )
}
