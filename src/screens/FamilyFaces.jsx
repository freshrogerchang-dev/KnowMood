import { useEffect, useMemo, useState } from 'react'
import { Screen, ProgressDots, BigButton } from '../components/UI'
import RoundEnd from '../components/RoundEnd'
import EmotionFace from '../components/EmotionFace'
import FamilyPhoto from '../components/FamilyPhoto'
import Ruby from '../components/Ruby'
import { activeEmotions, getEmotion } from '../data/emotions'
import { useFamilyAlbum } from '../lib/familyPhotos'
import { useApp } from '../lib/store'
import { speak } from '../lib/speech'
import { sfx } from '../lib/sound'
import { buildRound, buildChoices } from '../lib/quiz'

// 真人表情
//
// 情緒圖鑑教的是卡通臉譜；這裡練的是「把學到的東西用在真人臉上」——
// 研究指出 ASD 孩子處理卡通臉和真人臉的策略不一樣，有些孩子不容易把卡通
// 當成真實事物的代表，這個落差需要另外練習，不會自動類化過去。
//
// 題目是家人的真實照片，答案選項維持跟其他遊戲一樣的 SVG 臉譜卡片 ——
// 這樣孩子做的事情正好是「把真人表情對應回已經學會的抽象符號」，
// 兩個方向都在練。照片只是題目來源，不會出現在答案選項裡。
export default function FamilyFaces({ go }) {
  const { settings, addStars, recordAttempt } = useApp()
  const { ready, members, hasPhoto } = useFamilyAlbum()
  const pool = useMemo(() => activeEmotions(settings), [settings])
  const len = settings.roundLength

  // 家人 × 目前開放的情緒，篩出「有照片」的組合
  const pairs = useMemo(() => {
    if (!ready) return []
    const out = []
    for (const m of members) {
      for (const e of pool) {
        if (hasPhoto(m.id, e.id)) out.push({ memberId: m.id, memberName: m.name, emotionId: e.id })
      }
    }
    return out
  }, [ready, members, pool, hasPhoto])

  const usable = ready && pairs.length >= 1 && pool.length >= Math.min(2, settings.choices)

  const [seed, setSeed] = useState(0)
  // pairs 可能是空的（還沒有照片、或 IndexedDB 還在讀取中），這種情況下沒有題目可出。
  const round = useMemo(
    () => (pairs.length ? buildRound(pairs, Math.min(len, Math.max(1, pairs.length * 3))) : []),
    [pairs, len, seed],
  )
  const [qi, setQi] = useState(0)
  const [wrong, setWrong] = useState([])
  const [solved, setSolved] = useState(false)
  const [earned, setEarned] = useState(0)
  const [done, setDone] = useState(false)

  const q = round[qi]
  const answer = q ? getEmotion(q.emotionId) : null
  const choices = useMemo(
    () => (answer ? buildChoices(answer, pool, settings.choices) : []),
    [answer, pool, settings.choices, qi, seed], // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    if (done || !usable || !q) return
    const t = setTimeout(() => speak(`這是${q.memberName}的表情，他是什麼心情？`, settings), 400)
    return () => clearTimeout(t)
  }, [qi, done]) // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (c) => {
    if (solved) return
    if (c.id === answer.id) {
      setSolved(true)
      sfx.correct(settings)
      const first = wrong.length === 0
      if (first) { addStars(1); setEarned((n) => n + 1) }
      recordAttempt({ mode: 'family', emotionId: answer.id, correct: first, tries: wrong.length + 1 })
      speak(`對了，這是${answer.name}。`, settings)
    } else {
      sfx.retry(settings)
      setWrong((w) => [...w, c.id])
      speak('再看一次他的表情。', settings)
    }
  }

  const next = () => {
    if (qi + 1 >= round.length) setDone(true)
    else { setQi((n) => n + 1); setWrong([]); setSolved(false) }
  }

  const restart = () => {
    setSeed((s) => s + 1); setQi(0); setWrong([]); setSolved(false); setEarned(0); setDone(false)
  }

  if (!usable) {
    return (
      <Screen title="真人表情" onBack={() => go('home')}>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center max-w-xl mx-auto">
          <div className="text-7xl" aria-hidden="true">👪</div>
          <h2 className="text-3xl font-display font-bold">還沒有家人的照片</h2>
          <p className="text-xl text-inkSoft leading-relaxed">
            請大人到「家長設定 → 真人表情 → 管理家人表情相簿」，
            拍幾張家人做出不同表情的照片，就可以在這裡練習囉。
          </p>
          <BigButton onClick={() => go('home')} color="#F3C14F">🏠 回家</BigButton>
        </div>
      </Screen>
    )
  }

  if (done || !q) {
    return (
      <Screen title="真人表情" onBack={() => go('home')}>
        <RoundEnd earned={earned} total={round.length} onAgain={restart} onHome={() => go('home')} onRewards={() => go('rewards')} />
      </Screen>
    )
  }

  const hint = wrong.length >= 2

  return (
    <Screen title="真人表情" onBack={() => go('home')}>
      <ProgressDots total={round.length} done={qi} />

      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-2 w-full max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-2">
          <div className="card p-2" style={{ '--edge': '#C9B9E0' }}>
            <FamilyPhoto
              memberId={q.memberId}
              emotionId={q.emotionId}
              alt={`${q.memberName}的表情`}
              className="w-[220px] h-[220px] object-cover rounded-2xl"
            />
          </div>
          <p className="text-xl text-inkSoft">這是 <b>{q.memberName}</b> 的表情</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold">他是什麼心情？</h2>
        </div>

        <div className={`grid gap-3 w-full ${choices.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
          {choices.map((c) => {
            const isWrong = wrong.includes(c.id)
            const isRight = solved && c.id === answer.id
            return (
              <button
                key={c.id}
                type="button"
                disabled={isWrong || solved}
                aria-label={c.name}
                onClick={() => pick(c)}
                className={`tap card p-3 flex flex-col items-center gap-1 transition-all duration-300
                  ${isWrong ? 'opacity-25 grayscale' : ''} ${isRight ? 'scale-105 ring-8' : ''}
                  ${hint && c.id === answer.id && !solved ? 'animate-floatY ring-4' : ''}`}
                style={{ borderColor: c.color, '--edge': c.color, '--tw-ring-color': `${c.color}66`,
                         backgroundColor: isRight ? `${c.color}22` : undefined }}
              >
                <EmotionFace emotion={c} size={120} animate={isRight} className="w-full h-auto max-w-[120px]" />
                <span className="text-2xl font-bold" style={{ color: c.color }}>
                  <Ruby text={c.name} zhuyin={c.zhuyin} show={settings.zhuyin} />
                </span>
              </button>
            )
          })}
        </div>

        {solved ? (
          <BigButton onClick={next} color="#93C08A">
            {qi + 1 >= round.length ? '看看拿到幾顆星星 ⭐' : '下一張照片 ▶'}
          </BigButton>
        ) : (
          wrong.length > 0 && <p className="text-xl text-inkSoft">沒關係，再看一次 👀</p>
        )}
      </div>
    </Screen>
  )
}
