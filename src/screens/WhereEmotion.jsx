import { useEffect, useMemo, useState } from 'react'
import { Screen, ProgressDots, SpeakButton, BigButton } from '../components/UI'
import RoundEnd from '../components/RoundEnd'
import EmotionFace from '../components/EmotionFace'
import Ruby from '../components/Ruby'
import { activeEmotions, getEmotion } from '../data/emotions'
import { reactionsOf, bodyOf, REACTION_OWNER } from '../data/reactions'
import { useApp } from '../lib/store'
import { speak } from '../lib/speech'
import { sfx } from '../lib/sound'
import { buildRound, shuffle, sample } from '../lib/quiz'

const TARGET_COUNT = 3 // 每個情緒要找出幾個反應

// 情緒在哪裡？
// 先認出「這個情緒會讓身體做什麼」，再看到「它在身體的哪個位置」。
// ASD 孩子常常是感覺到了卻不知道那是什麼，等到很大了才爆出來；
// 先學會辨認身體訊號，才有機會在情緒還小的時候就講出來。
export default function WhereEmotion({ go }) {
  const { settings, addStars, recordAttempt } = useApp()
  const pool = useMemo(() => activeEmotions(settings), [settings])
  const len = Math.max(2, Math.round(settings.roundLength / 2))

  const [seed, setSeed] = useState(0)
  const round = useMemo(() => buildRound(pool, len), [pool, len, seed])

  const [qi, setQi] = useState(0)
  const [found, setFound] = useState([])
  const [missed, setMissed] = useState([])
  const [solved, setSolved] = useState(false)
  const [earned, setEarned] = useState(0)
  const [done, setDone] = useState(false)

  const target = round[qi]

  // 三個是目標情緒的反應，三個從其他情緒混進來
  const cards = useMemo(() => {
    if (!target) return []
    const mine = sample(reactionsOf(target.id), TARGET_COUNT)
    // 干擾項每張來自「不同的」情緒，答錯時的提示才會涵蓋到比較多種心情
    const others = sample(pool.filter((e) => e.id !== target.id), TARGET_COUNT)
      .map((e) => sample(reactionsOf(e.id), 1)[0])
      .filter(Boolean)
    return shuffle([...mine, ...others])
  }, [target, pool, qi, seed]) // eslint-disable-line react-hooks/exhaustive-deps

  const mineCount = useMemo(
    () => cards.filter((c) => REACTION_OWNER[c.text] === target?.id).length,
    [cards, target],
  )

  useEffect(() => {
    if (done || !target) return
    const t = setTimeout(
      () => speak(`有「${target.name}」的時候，身體會做什麼？找出${mineCount}個。`, settings),
      300,
    )
    return () => clearTimeout(t)
  }, [qi, done]) // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (card) => {
    if (solved || found.includes(card.text) || missed.includes(card.text)) return
    const owner = REACTION_OWNER[card.text]
    if (owner === target.id) {
      sfx.correct(settings)
      const next = [...found, card.text]
      setFound(next)
      speak(card.text, settings)
      if (next.length >= mineCount) {
        // 一次都沒挑錯才算答對
        const clean = missed.length === 0
        recordAttempt({ mode: 'where', emotionId: target.id, correct: clean, tries: missed.length + 1 })
        addStars(1)
        setEarned((n) => n + 1)
        setSolved(true)
        setTimeout(() => {
          sfx.star(settings)
          const b = bodyOf(target.id)
          speak(`全部找到了！有${target.name}的時候，${b.feel}`, settings)
        }, 500)
      }
    } else {
      sfx.retry(settings)
      setMissed((m) => [...m, card.text])
      const e = getEmotion(owner)
      speak(`這個比較像是「${e?.name || '別的心情'}」的時候。`, settings)
    }
  }

  const next = () => {
    if (qi + 1 >= len) setDone(true)
    else { setQi((n) => n + 1); setFound([]); setMissed([]); setSolved(false) }
  }

  const restart = () => {
    setSeed((s) => s + 1); setQi(0); setFound([]); setMissed([])
    setSolved(false); setEarned(0); setDone(false)
  }

  if (done || !target) {
    return (
      <Screen title="情緒在哪裡？" onBack={() => go('home')}>
        <RoundEnd earned={earned} total={len} onAgain={restart} onHome={() => go('home')} onRewards={() => go('rewards')} />
      </Screen>
    )
  }

  const body = bodyOf(target.id)

  return (
    <Screen title="情緒在哪裡？" onBack={() => go('home')}>
      <ProgressDots total={len} done={qi} />

      <div className="flex-1 flex flex-col items-center gap-4 py-2 w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <EmotionFace emotion={target} size={110} animate />
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold">
              有「<span style={{ color: target.color }}>
                <Ruby text={target.name} zhuyin={target.zhuyin} show={settings.zhuyin} />
              </span>」的時候，身體會做什麼？
            </h2>
            <p className="text-xl text-inkSoft">
              找出 {mineCount} 個・已經找到 {found.length} 個
            </p>
          </div>
          <SpeakButton
            text={`有${target.name}的時候，身體會做什麼？`}
            className="w-[56px] h-[56px] min-w-0 min-h-0 text-2xl shrink-0"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
          {cards.map((c) => {
            const isFound = found.includes(c.text)
            const isMissed = missed.includes(c.text)
            return (
              <button
                key={c.text}
                type="button"
                aria-label={c.text}
                disabled={isFound || isMissed || solved}
                onClick={() => pick(c)}
                className={`tap card p-3 flex flex-col items-center justify-center gap-1 text-center transition-all duration-300
                  ${isMissed ? 'opacity-25 grayscale' : ''} ${isFound ? 'ring-4 scale-[1.02]' : ''}`}
                style={{
                  borderColor: isFound ? target.color : '#E8E0D4',
                  '--edge': isFound ? target.color : '#E8E0D4',
                  '--tw-ring-color': `${target.color}66`,
                  backgroundColor: isFound ? `${target.color}1F` : undefined,
                }}
              >
                <span className="text-4xl md:text-5xl" aria-hidden="true">{c.icon}</span>
                <span className="text-xl md:text-2xl font-bold leading-snug">{c.text}</span>
                {isFound && <span className="text-2xl" aria-hidden="true">✅</span>}
              </button>
            )
          })}
        </div>

        {missed.length > 0 && !solved && (
          <p className="text-xl text-inkSoft">沒關係，那個是別的心情的反應 👍</p>
        )}

        {/* 找完之後：這個情緒在身體的哪裡 */}
        {solved && (
          <div className="w-full flex flex-col items-center gap-3 animate-popIn">
            <div className="card w-full p-4 flex items-start gap-4" style={{ '--edge': target.color }}>
              <span className="text-5xl shrink-0" aria-hidden="true">🧍</span>
              <div className="flex-1">
                <p className="text-xl font-bold mb-1" style={{ color: target.color }}>
                  「{target.name}」在身體的：{body.where}
                </p>
                <p className="text-xl leading-relaxed">{body.feel}</p>
                <p className="text-lg text-inkSoft mt-2">
                  其他反應：{reactionsOf(target.id).filter((r) => !found.includes(r.text)).map((r) => r.text).join('、')}
                </p>
              </div>
              <SpeakButton text={body.feel} className="w-[56px] h-[56px] min-w-0 min-h-0 text-2xl shrink-0" />
            </div>
            <BigButton onClick={next} color="#93C08A">
              {qi + 1 >= len ? '看看拿到幾顆星星 ⭐' : '下一個心情 ▶'}
            </BigButton>
          </div>
        )}
      </div>
    </Screen>
  )
}
