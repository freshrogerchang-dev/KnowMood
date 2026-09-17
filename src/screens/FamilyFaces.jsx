import { useEffect, useMemo, useState } from 'react'
import { Screen, ProgressDots, BigButton } from '../components/UI'
import Icon from '../components/Icon'
import RoundEnd from '../components/RoundEnd'
import EmotionFace from '../components/EmotionFace'
import FamilyPhoto from '../components/FamilyPhoto'
import Ruby from '../components/Ruby'
import { activeEmotions, getEmotion } from '../data/emotions'
import { useFamilyAlbum } from '../lib/familyPhotos'
import { useApp } from '../lib/store'
import { speak } from '../lib/speech'
import { sfx } from '../lib/sound'
import { buildRound, buildChoices, randomOf } from '../lib/quiz'

// 真人表情
//
// 情緒圖鑑教的是卡通臉譜；這裡練的是「把學到的東西用在真人臉上」——
// 研究指出 ASD 孩子處理卡通臉和真人臉的策略不一樣，有些孩子不容易把卡通
// 當成真實事物的代表，這個落差需要另外練習，不會自動類化過去。
//
// 題目是家人的真實照片，答案選項維持跟其他遊戲一樣的 SVG 臉譜卡片 ——
// 這樣孩子做的事情正好是「把真人表情對應回已經學會的抽象符號」，
// 兩個方向都在練。照片只是題目來源，不會出現在答案選項裡。

/**
 * 示範畫面：借用「情緒圖鑑」已經做好的插畫臉譜當作「假裝是照片」的內容，
 * 讓爸媽在還沒拍照片前，也能看到這個模式實際玩起來是什麼樣子。
 *
 * ⚠️ 這不是真正的練習：
 * - 不呼叫 addStars / recordAttempt，不會污染孩子真正的星星和紀錄
 * - 畫面上明確標示「示範・不是真的照片」，虛線外框跟真正的照片卡區分開來
 * - 用中性的 tap 音效，不用 correct/star 音效，避免讓孩子誤以為這是在得分
 * - 教學價值上其實跟「配對遊戲」重複（卡通對卡通，沒有真人→符號的轉換），
 *   純粹是給家長看操作流程用的
 */
function DemoRound({ pool, settings, onExit }) {
  const [answer] = useState(() => randomOf(pool))
  const [picked, setPicked] = useState(null)
  const choices = useMemo(() => buildChoices(answer, pool, settings.choices), [answer, pool, settings.choices]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(
      () => speak('這是示範，不是真的照片。想像這是家人的表情，他是什麼心情？', settings),
      300,
    )
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pick = (c) => {
    if (picked) return
    setPicked(c.id)
    sfx.tap(settings)
    speak(c.id === answer.id ? `對了，這是${answer.name}。` : `示範的答案是${answer.name}。`, settings)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-2 w-full max-w-4xl mx-auto animate-popIn">
      <div className="card px-4 py-2" style={{ '--edge': '#B99A75', backgroundColor: '#F3ECE0' }}>
        <p className="text-lg font-bold flex items-center gap-1"><Icon name="demo" size={22} />示範畫面・不是真的照片</p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="card p-2 border-dashed" style={{ '--edge': '#B99A75' }}>
          <div
            className="w-[200px] h-[200px] flex items-center justify-center rounded-2xl"
            style={{ backgroundColor: answer.tint }}
          >
            <EmotionFace emotion={answer} size={160} animate />
          </div>
        </div>
        <p className="text-lg text-inkSoft">想像這是「家人」的表情</p>
        <h2 className="text-2xl font-display font-bold">他是什麼心情？</h2>
      </div>

      <div className={`grid gap-3 w-full ${choices.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
        {choices.map((c) => {
          const isRight = picked && c.id === answer.id
          const isWrongPick = picked === c.id && c.id !== answer.id
          return (
            <button
              key={c.id}
              type="button"
              disabled={!!picked}
              aria-label={c.name}
              onClick={() => pick(c)}
              className={`tap card p-3 flex flex-col items-center gap-1 transition-all duration-300
                ${isRight ? 'ring-8 scale-105' : ''} ${isWrongPick ? 'opacity-40' : ''}`}
              style={{ borderColor: c.color, '--edge': c.color, '--tw-ring-color': `${c.color}66`,
                       backgroundColor: isRight ? `${c.color}22` : undefined }}
            >
              <EmotionFace emotion={c} size={110} animate={isRight} className="w-full h-auto max-w-[110px]" />
              <span className="text-xl font-bold" style={{ color: c.color }}>
                <Ruby text={c.name} zhuyin={c.zhuyin} show={settings.zhuyin} />
              </span>
            </button>
          )
        })}
      </div>

      {picked && (
        <div className="flex flex-col items-center gap-3 animate-popIn">
          <p className="text-xl text-center max-w-lg text-inkSoft">
            真正玩的時候，這裡會換成家人真實的照片，答案選項不會變。
          </p>
          <BigButton onClick={onExit} color="#F3C14F"><Icon name="home" size={26} />回家</BigButton>
        </div>
      )}
    </div>
  )
}

export default function FamilyFaces({ go }) {
  const { settings, addStars, recordAttempt } = useApp()
  const [demo, setDemo] = useState(false)
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
    if (demo) {
      return (
        <Screen title="真人表情（示範）" onBack={() => go('home')}>
          <DemoRound pool={pool} settings={settings} onExit={() => go('home')} />
        </Screen>
      )
    }
    return (
      <Screen title="真人表情" onBack={() => go('home')}>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center max-w-xl mx-auto">
          <Icon name="family" size={72} color="#9C8FC2" tint="#EFEAF7" />
          <h2 className="text-3xl font-display font-bold">還沒有家人的照片</h2>
          <p className="text-xl text-inkSoft leading-relaxed">
            請大人到「家長設定 → 真人表情 → 管理家人表情相簿」，
            拍幾張家人做出不同表情的照片，就可以在這裡練習囉。
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <BigButton onClick={() => setDemo(true)} color="#9C8FC2"><Icon name="demo" size={26} />看示範怎麼玩</BigButton>
            <BigButton onClick={() => go('home')} color="#F3C14F"><Icon name="home" size={26} />回家</BigButton>
          </div>
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
            {qi + 1 >= round.length ? <>看看拿到幾顆星星<Icon name="star" size={26} color="#D8AE57" /></> : '下一張照片 ▶'}
          </BigButton>
        ) : (
          wrong.length > 0 && <p className="text-xl text-inkSoft flex items-center justify-center gap-1">沒關係，再看一次<Icon name="eye" size={20} /></p>
        )}
      </div>
    </Screen>
  )
}
