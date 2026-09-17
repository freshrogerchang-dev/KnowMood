import { useCallback, useEffect, useMemo, useState } from 'react'
import { Screen, ProgressDots, SpeakButton, BigButton } from '../components/UI'
import RoundEnd from '../components/RoundEnd'
import EmotionFace from '../components/EmotionFace'
import Ruby from '../components/Ruby'
import { activeEmotions, getEmotion } from '../data/emotions'
import { storiesFor } from '../data/stories'
import { useApp } from '../lib/store'
import { speak } from '../lib/speech'
import { sfx } from '../lib/sound'
import { buildChoices, shuffle } from '../lib/quiz'
import { INTENSITY } from './Journal'

// 情緒小偵探：比「情境猜猜看」再進一階。
// 故事比較長、線索比較多，而且答完情緒還要判斷「有多強烈」。
//
// 強度那一步刻意「沒有錯的答案」：選到大部分人的區間內會多一顆星星，
// 選在區間外不扣分、不重來，只會聽到「大部分的人會覺得幾分，因為……」。
// 情緒強度本來就因人而異，否定孩子自己的感覺會把整件事教壞。
export default function Detective({ go }) {
  const { settings, addStars, recordAttempt } = useApp()
  const pool = useMemo(() => activeEmotions(settings), [settings])
  // 一題兩個步驟，題數減半，才不會一輪拖太久
  const len = Math.max(3, Math.round(settings.roundLength / 2))

  const [seed, setSeed] = useState(0)
  const round = useMemo(() => {
    const bank = storiesFor(pool.map((e) => e.id))
    const picked = shuffle(bank).slice(0, len)
    while (picked.length < len && bank.length) picked.push(bank[picked.length % bank.length])
    return picked
  }, [pool, len, seed])

  const [qi, setQi] = useState(0)
  const [phase, setPhase] = useState('emotion')  // emotion → intensity → reveal
  const [wrong, setWrong] = useState([])
  const [intensity, setIntensity] = useState(null)
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
    const t = setTimeout(() => speak(`${q.story} 他現在覺得怎麼樣？`, settings), 300)
    return () => clearTimeout(t)
  }, [qi, done]) // eslint-disable-line react-hooks/exhaustive-deps

  const pickEmotion = (c) => {
    if (c.id === answer.id) {
      sfx.correct(settings)
      const first = wrong.length === 0
      if (first) { addStars(1); setEarned((n) => n + 1) }
      recordAttempt({ mode: 'detective', emotionId: answer.id, correct: first, tries: wrong.length + 1 })
      setPhase('intensity')
      speak(`答對了，他覺得${answer.name}。那這個${answer.name}有多少呢？`, settings)
    } else {
      sfx.retry(settings)
      setWrong((w) => [...w, c.id])
      speak('再看一次故事，他身上發生了什麼事？', settings)
    }
  }

  const inBand = intensity != null && intensity >= q?.band[0] && intensity <= q?.band[1]

  const pickIntensity = (v) => {
    setIntensity(v)
    sfx.tap(settings)
    speak(`${INTENSITY[v - 1].label}，${v}分`, settings)
  }

  const reveal = () => {
    setPhase('reveal')
    if (inBand) {
      addStars(1)
      setEarned((n) => n + 1)
      sfx.star(settings)
      speak(`跟大部分的人想的一樣！多拿一顆星星。${q.because}`, settings)
    } else {
      sfx.correct(settings)
      speak(`每個人的感覺可以不一樣，沒關係。大部分的人會覺得${q.band[0]}到${q.band[1]}分，${q.because}`, settings)
    }
  }

  const next = useCallback(() => {
    if (qi + 1 >= len) setDone(true)
    else { setQi((n) => n + 1); setPhase('emotion'); setWrong([]); setIntensity(null) }
  }, [qi, len])

  const restart = () => {
    setSeed((s) => s + 1); setQi(0); setPhase('emotion')
    setWrong([]); setIntensity(null); setEarned(0); setDone(false)
  }

  if (done || !q) {
    return (
      <Screen title="情緒小偵探" onBack={() => go('home')}>
        <RoundEnd earned={earned} total={len} onAgain={restart} onHome={() => go('home')} onRewards={() => go('rewards')} />
      </Screen>
    )
  }

  const hint = wrong.length >= 2

  return (
    <Screen title="情緒小偵探" onBack={() => go('home')}>
      <ProgressDots total={len} done={qi} />

      <div className="flex-1 flex flex-col items-center gap-4 py-2 w-full max-w-4xl mx-auto">
        {/* 故事卡 */}
        <div className="card w-full p-4 md:p-5 flex items-start gap-4" style={{ '--edge': '#D9C9A8' }}>
          <span className="text-6xl md:text-7xl shrink-0" aria-hidden="true">{q.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-lg text-inkSoft mb-1">🔍 {q.title}</p>
            <p className="text-xl md:text-2xl leading-relaxed">{q.story}</p>
          </div>
          <SpeakButton text={q.story} className="w-[64px] h-[64px] min-w-0 min-h-0 text-3xl shrink-0" />
        </div>

        {/* 第一步：他覺得怎麼樣？ */}
        {phase === 'emotion' && (
          <>
            <h2 className="text-3xl font-display font-bold">他現在覺得怎麼樣？</h2>
            <div className={`grid gap-3 w-full ${choices.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
              {choices.map((c) => {
                const isWrong = wrong.includes(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={isWrong}
                    aria-label={c.name}
                    onClick={() => pickEmotion(c)}
                    className={`tap card p-3 flex flex-col items-center gap-1 transition-all duration-300
                      ${isWrong ? 'opacity-25 grayscale' : ''} ${hint && c.id === answer.id ? 'animate-floatY ring-4' : ''}`}
                    style={{ borderColor: c.color, '--edge': c.color, '--tw-ring-color': `${c.color}66` }}
                  >
                    <EmotionFace emotion={c} size={130} className="w-full h-auto max-w-[130px]" />
                    <span className="text-2xl font-bold" style={{ color: c.color }}>
                      <Ruby text={c.name} zhuyin={c.zhuyin} show={settings.zhuyin} />
                    </span>
                  </button>
                )
              })}
            </div>
            {wrong.length > 0 && <p className="text-xl text-inkSoft">沒關係，再看一次故事 🔍</p>}
          </>
        )}

        {/* 第二步：這個情緒有多強？ */}
        {phase === 'intensity' && (
          <>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-display font-bold text-center">
                他的「<span style={{ color: answer.color }}>{answer.name}</span>」有多少？
              </h2>
              <SpeakButton text={`他的${answer.name}有多少？`} className="w-[56px] h-[56px] min-w-0 min-h-0 text-2xl" />
            </div>
            <div className="flex items-end justify-center gap-2 md:gap-3 w-full">
              {INTENSITY.map((lv) => (
                <button
                  key={lv.v}
                  type="button"
                  aria-label={`${lv.label}，${lv.v}分`}
                  onClick={() => pickIntensity(lv.v)}
                  className={`tap card p-2 flex flex-col items-center justify-end gap-1 flex-1 max-w-[132px] transition-all
                    ${intensity === lv.v ? 'ring-8 scale-[1.03]' : 'opacity-80'}`}
                  style={{ borderColor: answer.color, '--edge': answer.color, '--tw-ring-color': `${answer.color}55` }}
                >
                  <EmotionFace emotion={answer} size={Math.round(96 * lv.scale)} className="h-auto" />
                  <span className="text-3xl font-bold tabular-nums" style={{ color: answer.color }}>{lv.v}</span>
                  <span className="text-base md:text-lg text-inkSoft">{lv.label}</span>
                </button>
              ))}
            </div>
            <BigButton onClick={reveal} color="#93C08A" mute
              className={intensity ? '' : 'opacity-40 pointer-events-none'}>
              🔍 公布線索
            </BigButton>
          </>
        )}

        {/* 第三步：攤開線索 */}
        {phase === 'reveal' && (
          <div className="w-full flex flex-col items-center gap-3 animate-popIn">
            <div className="flex items-center gap-4">
              <EmotionFace emotion={answer} size={110} animate />
              <div className="text-left">
                <p className="text-3xl font-bold" style={{ color: answer.color }}>
                  <Ruby text={answer.name} zhuyin={answer.zhuyin} show={settings.zhuyin} />
                </p>
                <p className="text-xl text-inkSoft">
                  你猜 {intensity} 分・大部分的人 {q.band[0]}–{q.band[1]} 分
                  {inBand && <span className="ml-2">⭐ +1</span>}
                </p>
              </div>
            </div>

            <div className="card w-full p-4" style={{ '--edge': answer.color }}>
              <p className="text-xl font-bold mb-2">🔍 你找到的線索</p>
              <ul className="space-y-1">
                {q.clues.map((c) => (
                  <li key={c} className="text-xl flex items-start gap-2">
                    <span aria-hidden="true">✓</span><span>{c}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xl leading-relaxed mt-3 pt-3 border-t-2 border-line">{q.because}</p>
            </div>

            <BigButton onClick={next} color="#93C08A">
              {qi + 1 >= len ? '看看拿到幾顆星星 ⭐' : '下一個故事 ▶'}
            </BigButton>
          </div>
        )}
      </div>
    </Screen>
  )
}
