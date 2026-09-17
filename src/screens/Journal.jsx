import { useMemo, useState } from 'react'
import { Screen, SpeakButton, BigButton } from '../components/UI'
import EmotionFace from '../components/EmotionFace'
import Ruby from '../components/Ruby'
import { activeEmotions, getEmotion } from '../data/emotions'
import { wordsForIntensity } from '../data/vocabulary'
import { useApp } from '../lib/store'
import { speak } from '../lib/speech'
import { sfx } from '../lib/sound'

export const todayStr = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// 常見事件模板：孩子還不會打字，用點的最快；大人也可以直接輸入
const EVENT_CHIPS = [
  { icon: '🏫', text: '在學校的時候' },
  { icon: '🧸', text: '在玩玩具的時候' },
  { icon: '👫', text: '跟朋友一起玩' },
  { icon: '🍚', text: '吃飯的時候' },
  { icon: '🛝', text: '去公園玩' },
  { icon: '📺', text: '看電視的時候' },
  { icon: '🛏️', text: '要睡覺的時候' },
  { icon: '🚗', text: '出門坐車的時候' },
]

export const INTENSITY = [
  { v: 1, label: '一點點', scale: 0.55 },
  { v: 2, label: '有一些', scale: 0.7 },
  { v: 3, label: '普通', scale: 0.85 },
  { v: 4, label: '很多', scale: 1 },
  { v: 5, label: '非常多', scale: 1.15 },
]

export default function Journal({ go }) {
  const { settings, state, addStars, addJournal, removeJournal } = useApp()
  const pool = useMemo(() => activeEmotions(settings), [settings])

  const [step, setStep] = useState(0) // 0 事件 → 1 情緒 → 2 強度 → 3 完成
  const [event, setEvent] = useState('')
  const [emotionId, setEmotionId] = useState(null)
  const [intensity, setIntensity] = useState(null)
  const [word, setWord] = useState(null)   // 更精準的說法（選填）
  const [showLog, setShowLog] = useState(false)
  const [savedId, setSavedId] = useState(null)   // 剛存下的那筆，冷靜角做完要寫回去

  const emotion = emotionId ? getEmotion(emotionId) : null
  // 符合這個強度的說法，最多給 3 個 —— 選項太多對 5 歲反而是負擔
  const vocab = useMemo(
    () => (emotionId && intensity ? wordsForIntensity(emotionId, intensity).slice(0, 3) : []),
    [emotionId, intensity],
  )

  const reset = () => { setStep(0); setEvent(''); setEmotionId(null); setIntensity(null); setWord(null); setSavedId(null) }

  const finish = () => {
    const label = word?.word || emotion.name
    const row = addJournal({ date: todayStr(), event: event.trim() || '今天', emotionId, intensity, word: word?.word || '' })
    setSavedId(row.id)
    addStars(1)
    sfx.star(settings)
    speak(`記好了！你在${event.trim() || '今天'}覺得${label}，${INTENSITY[intensity - 1].label}。${emotion.cope}`, settings)
    setStep(3)
  }

  if (showLog) {
    return (
      <Screen title="心情回顧" onBack={() => setShowLog(false)} backIcon="◀" backLabel="返回">
        <div className="flex-1 overflow-y-auto space-y-3 max-w-3xl w-full mx-auto">
          {state.journal.length === 0 && (
            <p className="text-center text-xl text-inkSoft py-10">還沒有紀錄，先去記一次今天的心情吧！</p>
          )}
          {state.journal.map((j) => {
            const e = getEmotion(j.emotionId)
            if (!e) return null
            return (
              <div key={j.id} className="card p-3 flex items-center gap-3">
                <EmotionFace emotion={e} size={64} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-inkSoft">{j.date}</p>
                  <p className="text-xl font-bold truncate">{j.event}</p>
                  <p className="text-lg" style={{ color: e.color }}>
                    {j.word ? `${j.word}（${e.name}）` : e.name}・{'●'.repeat(j.intensity)}
                    <span className="text-line">{'●'.repeat(5 - j.intensity)}</span>
                    <span className="text-inkSoft text-base ml-1">{j.intensity}/5</span>
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="刪除這筆紀錄"
                  onClick={() => removeJournal(j.id)}
                  className="tap w-[56px] h-[56px] min-w-0 min-h-0 text-2xl text-inkSoft"
                >
                  🗑️
                </button>
              </div>
            )
          })}
        </div>
      </Screen>
    )
  }

  return (
    <Screen
      title="今天的心情"
      onBack={() => go('home')}
      right={
        <button type="button" onClick={() => setShowLog(true)}
          className="tap card w-[72px] h-[72px] min-w-0 min-h-0 text-3xl flex items-center justify-center" aria-label="看以前的紀錄">
          📖
        </button>
      }
    >
      <div className="flex-1 flex flex-col items-center gap-4 w-full max-w-3xl mx-auto">
        {/* 步驟 1：發生什麼事 */}
        {step === 0 && (
          <div className="w-full flex flex-col gap-3 animate-popIn">
            <div className="flex items-center gap-3 justify-center">
              <h2 className="text-3xl font-bold text-center">今天發生了什麼事？</h2>
              <SpeakButton text="今天發生了什麼事？" className="w-[56px] h-[56px] min-w-0 min-h-0 text-2xl" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {EVENT_CHIPS.map((c) => (
                <button
                  key={c.text}
                  type="button"
                  onClick={() => { sfx.tap(settings); setEvent(c.text); speak(c.text, settings) }}
                  className={`tap card p-3 flex flex-col items-center gap-1 ${event === c.text ? 'ring-4 ring-calm/50' : ''}`}
                >
                  <span className="text-4xl" aria-hidden="true">{c.icon}</span>
                  <span className="text-lg font-bold text-center leading-snug">{c.text}</span>
                </button>
              ))}
            </div>
            <textarea
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              rows={2}
              placeholder="也可以由大人幫忙打字，寫下更完整的事情⋯⋯"
              className="card p-4 text-xl w-full resize-none"
            />
            <BigButton onClick={() => { setStep(1); speak('那你的心情是什麼呢？', settings) }} color="#93C08A" className="self-center">
              下一步 ▶
            </BigButton>
          </div>
        )}

        {/* 步驟 2：什麼心情 */}
        {step === 1 && (
          <div className="w-full flex flex-col gap-3 animate-popIn">
            <div className="flex items-center gap-3 justify-center">
              <h2 className="text-3xl font-bold text-center">你的心情是什麼？</h2>
              <SpeakButton text="你的心情是什麼？" className="w-[56px] h-[56px] min-w-0 min-h-0 text-2xl" />
            </div>
            <p className="text-center text-xl text-inkSoft">{event || '今天'}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {pool.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  aria-label={e.name}
                  onClick={() => {
                    sfx.tap(settings)
                    setEmotionId(e.id)
                    speak(e.name, settings)
                    setTimeout(() => { setStep(2); speak(`那個${e.name}有多少呢？`, settings) }, 600)
                  }}
                  className="tap card p-3 flex flex-col items-center gap-1"
                  style={{ borderColor: e.color, '--edge': e.color}}
                >
                  <EmotionFace emotion={e} size={110} className="w-full h-auto max-w-[110px]" />
                  <span className="text-2xl font-bold" style={{ color: e.color }}>
                    <Ruby text={e.name} zhuyin={e.zhuyin} show={settings.zhuyin} />
                  </span>
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setStep(0)} className="text-inkSoft text-lg underline">◀ 回上一步</button>
          </div>
        )}

        {/* 步驟 3：情緒溫度計 1-5 */}
        {step === 2 && emotion && (
          <div className="w-full flex flex-col gap-4 items-center animate-popIn">
            <div className="flex items-center gap-3 justify-center">
              <h2 className="text-3xl font-bold text-center">
                你的「<span style={{ color: emotion.color }}>{emotion.name}</span>」有多少？
              </h2>
              <SpeakButton text={`你的${emotion.name}有多少？`} className="w-[56px] h-[56px] min-w-0 min-h-0 text-2xl" />
            </div>

            <div className="flex items-end justify-center gap-2 md:gap-3 w-full">
              {INTENSITY.map((lv) => (
                <button
                  key={lv.v}
                  type="button"
                  onClick={() => { sfx.tap(settings); setIntensity(lv.v); setWord(null); speak(`${lv.label}，${lv.v}分`, settings) }}
                  className={`card p-2 min-h-[104px] min-w-0 select-none flex flex-col items-center justify-end gap-1 flex-1 max-w-[132px] transition-all
                    ${intensity === lv.v ? 'ring-8 scale-[1.03]' : 'opacity-80'}`}
                  style={{ borderColor: emotion.color, '--edge': emotion.color, '--tw-ring-color': `${emotion.color}55` }}
                  aria-label={`${lv.label}，${lv.v}分`}
                >
                  <span className="block" style={{ width: `${Math.round(lv.scale * 72)}%` }}>
                    <EmotionFace emotion={emotion} size={104} className="w-full h-auto" />
                  </span>
                  <span className="text-2xl md:text-3xl font-bold tabular-nums" style={{ color: emotion.color }}>{lv.v}</span>
                  <span className="text-sm md:text-lg text-inkSoft leading-tight">{lv.label}</span>
                </button>
              ))}
            </div>

            {settings.richVocab !== false && intensity && vocab.length > 0 && (
              <div className="w-full max-w-3xl animate-popIn">
                <p className="text-center text-lg text-inkSoft mb-2">
                  這種感覺也可以說…（想選再選，不選也可以）
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {vocab.map((w) => (
                    <button
                      key={w.word}
                      type="button"
                      aria-label={w.word}
                      onClick={() => {
                        sfx.tap(settings)
                        const picked = word?.word === w.word ? null : w
                        setWord(picked)
                        if (picked) speak(`${w.word}。${w.when}`, settings)
                      }}
                      className={`tap min-h-0 h-auto px-4 py-2 rounded-2xl border-2 text-2xl font-bold ${
                        word?.word === w.word ? 'ring-4' : 'opacity-75'
                      }`}
                      style={{
                        borderColor: emotion.color, '--edge': emotion.color,
                        color: emotion.color,
                        '--tw-ring-color': `${emotion.color}55`,
                        backgroundColor: word?.word === w.word ? `${emotion.color}1F` : undefined,
                      }}
                    >
                      <Ruby text={w.word} zhuyin={w.zhuyin} show={settings.zhuyin} />
                    </button>
                  ))}
                </div>
                {word && <p className="text-center text-lg mt-2">{word.when}</p>}
              </div>
            )}

            <div className="flex gap-3 items-center">
              <button type="button" onClick={() => setStep(1)} className="text-inkSoft text-lg underline">◀ 回上一步</button>
              <BigButton onClick={finish} color="#93C08A" disabled={!intensity}
                className={!intensity ? 'opacity-40 pointer-events-none' : ''}>
                ✅ 記下來
              </BigButton>
            </div>
          </div>
        )}

        {/* 步驟 4：完成 */}
        {step === 3 && emotion && (
          <div className="flex flex-col items-center gap-4 text-center animate-popIn">
            <div className="text-6xl" aria-hidden="true">📔</div>
            <h2 className="text-3xl font-bold">記好了！</h2>
            <div className="card p-5 flex items-center gap-4 max-w-2xl">
              <EmotionFace emotion={emotion} size={110} animate />
              <div className="text-left">
                <p className="text-xl text-inkSoft">{todayStr()}</p>
                <p className="text-2xl font-bold">{event || '今天'}</p>
                <p className="text-2xl" style={{ color: emotion.color }}>
                  {word ? `${word.word}（${emotion.name}）` : emotion.name}・
                  {INTENSITY[intensity - 1].label}（{intensity}/5）
                </p>
              </div>
            </div>
            <div className="card p-4 max-w-2xl text-xl leading-relaxed flex items-center gap-3">
              <p className="flex-1">💡 {emotion.cope}</p>
              <SpeakButton text={emotion.cope} className="w-[56px] h-[56px] min-w-0 min-h-0 text-2xl shrink-0" />
            </div>
            {intensity >= 4 && (
              <div className="card p-4 max-w-2xl w-full flex items-center gap-4 animate-popIn"
                style={{ '--edge': '#93A88C', backgroundColor: '#EAF1E8' }}>
                <span className="text-5xl shrink-0" aria-hidden="true">🌿</span>
                <p className="flex-1 text-xl text-left">
                  這個「{emotion.name}」有點大。要不要先去冷靜角做一件事？
                </p>
                <BigButton
                  onClick={() => go('calm', { emotionId, intensity, journalId: savedId })}
                  color="#93A88C"
                  className="text-xl shrink-0"
                >
                  好
                </BigButton>
              </div>
            )}

            <div className="flex flex-wrap gap-3 justify-center">
              <BigButton onClick={reset} color="#6FC2C0">➕ 再記一件事</BigButton>
              <BigButton onClick={() => setShowLog(true)} color="#7FA9D4">📖 看回顧</BigButton>
              <BigButton onClick={() => go('home')} color="#F3C14F">🏠 回家</BigButton>
            </div>
          </div>
        )}
      </div>
    </Screen>
  )
}
