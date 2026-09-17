import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Screen, BigButton, SpeakButton } from '../components/UI'
import EmotionFace from '../components/EmotionFace'
import { getEmotion } from '../data/emotions'
import { CALM_TOOLS } from '../data/calmTools'
import { useApp } from '../lib/store'
import { speak, stopSpeaking } from '../lib/speech'
import { sfx } from '../lib/sound'
import { INTENSITY } from './Journal'

// 冷靜角
//
// 從日記進來時（params 有 emotionId / intensity / journalId）會多兩件事：
//   1. 開頭先說「你現在覺得生氣，很多。我們一起做一件事。」
//   2. 做完問「現在呢？」，把 before / after 寫回那筆日記
// 家長頁就能看出哪一個工具對這個孩子真的有效。
//
// 從主畫面進來時就只是工具，不留紀錄 —— 情緒上來的時候不該還要先填表。
export default function CalmCorner({ go, params }) {
  const { settings, updateJournal, addStars } = useApp()
  const fromJournal = Boolean(params?.journalId)
  const emotion = params?.emotionId ? getEmotion(params.emotionId) : null

  const [tool, setTool] = useState(null)
  const [stepIdx, setStepIdx] = useState(0)
  const [round, setRound] = useState(1)
  const [count, setCount] = useState(1)      // 數到十用
  const [holding, setHolding] = useState(false) // 擠一擠用
  const [finished, setFinished] = useState(false)
  const [after, setAfter] = useState(null)
  const [saved, setSaved] = useState(false)
  const timer = useRef(null)

  const motion = settings.lowSensory ? false : settings.motion !== false
  const step = tool && !tool.counting ? tool.steps[stepIdx] : null

  useEffect(() => () => { clearTimeout(timer.current); stopSpeaking() }, [])

  useEffect(() => {
    if (tool || finished) return
    const t = setTimeout(() => {
      speak(
        emotion
          ? `你現在覺得${emotion.name}，${INTENSITY[(params.intensity || 3) - 1].label}。我們一起做一件事，會比較舒服。`
          : '想做哪一個呢？',
        settings,
      )
    }, 400)
    return () => clearTimeout(t)
  }, [tool, finished]) // eslint-disable-line react-hooks/exhaustive-deps

  const done = useCallback(() => {
    clearTimeout(timer.current)
    setFinished(true)
    sfx.star(settings)
    addStars(1)
    speak('做得很好！你完成了。', settings)
  }, [settings, addStars])

  // ---- 呼吸 / 吹泡泡：照 steps 的節奏自動往下走 ----
  useEffect(() => {
    if (!tool || tool.counting || tool.hold || finished) return
    const s = tool.steps[stepIdx]
    speak(s.label, settings)
    if (s.sound === 'in') sfx.breatheIn(settings)
    if (s.sound === 'out') sfx.breatheOut(settings)
    timer.current = setTimeout(() => {
      if (stepIdx + 1 < tool.steps.length) setStepIdx(stepIdx + 1)
      else if (round < tool.rounds) { setRound(round + 1); setStepIdx(0) }
      else done()
    }, s.seconds * 1000)
    return () => clearTimeout(timer.current)
  }, [tool, stepIdx, round, finished]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---- 數到十 ----
  useEffect(() => {
    if (!tool?.counting || finished) return
    speak(String(count), settings)
    sfx.tap(settings)
    timer.current = setTimeout(() => {
      if (count < 10) setCount(count + 1)
      else done()
    }, 1100)
    return () => clearTimeout(timer.current)
  }, [tool, count, finished]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---- 擠一擠：要一直按著才會前進 ----
  useEffect(() => {
    if (!tool?.hold || finished) return
    const s = tool.steps[stepIdx]
    const needHold = stepIdx === 0
    if (needHold && !holding) return // 放開就停在原地等
    speak(s.label, settings)
    if (s.sound === 'out') sfx.breatheOut(settings)
    timer.current = setTimeout(() => {
      if (stepIdx + 1 < tool.steps.length) setStepIdx(stepIdx + 1)
      else if (round < tool.rounds) { setRound(round + 1); setStepIdx(0) }
      else done()
    }, s.seconds * 1000)
    return () => clearTimeout(timer.current)
  }, [tool, stepIdx, round, holding, finished]) // eslint-disable-line react-hooks/exhaustive-deps

  const start = (t) => {
    sfx.tap(settings)
    setTool(t); setStepIdx(0); setRound(1); setCount(1); setHolding(false); setFinished(false)
  }

  const reset = () => {
    clearTimeout(timer.current); stopSpeaking()
    setTool(null); setFinished(false); setAfter(null); setSaved(false)
  }

  const saveAfter = (v) => {
    setAfter(v)
    sfx.tap(settings)
    speak(`現在是${INTENSITY[v - 1].label}，${v}分。`, settings)
    if (fromJournal) {
      updateJournal(params.journalId, { calmTool: tool?.id || '', afterIntensity: v })
      setSaved(true)
    }
  }

  const color = emotion?.color || '#93C08A'
  const scale = step?.scale ?? (tool?.counting ? 1 : 1)

  return (
    <Screen title="冷靜角" onBack={() => go('home')} bg="bg-cream">
      <div className="flex-1 flex flex-col items-center justify-center gap-5 w-full max-w-3xl mx-auto">

        {/* 選工具 */}
        {!tool && (
          <>
            {emotion && (
              <div className="flex items-center gap-4 animate-popIn">
                <EmotionFace emotion={emotion} size={100} animate={motion} />
                <div>
                  <p className="text-2xl">
                    你現在覺得
                    <span className="font-bold" style={{ color }}>{emotion.name}</span>
                    ，{INTENSITY[(params.intensity || 3) - 1].label}。
                  </p>
                  <p className="text-xl text-inkSoft">我們一起做一件事，會比較舒服。</p>
                </div>
              </div>
            )}
            <h2 className="text-3xl font-display font-bold">想做哪一個？</h2>
            <div className="grid grid-cols-2 gap-3 w-full">
              {CALM_TOOLS.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  aria-label={t.name}
                  onClick={() => start(t)}
                  className={`tap card p-4 flex flex-col items-center gap-1 text-center ${i % 2 ? 'blob-b' : 'blob-a'}`}
                  style={{ borderColor: '#9CC49A', '--edge': '#9CC49A', backgroundColor: '#EAF3E7' }}
                >
                  <span className="text-5xl" aria-hidden="true">{t.icon}</span>
                  <span className="text-2xl font-display font-bold">{t.name}</span>
                  <span className="text-base text-ink/70 leading-snug">{t.hint}</span>
                </button>
              ))}
            </div>
            <BigButton onClick={() => go('home')} color="#B7AFA4" className="text-xl">🏠 不用了，回家</BigButton>
          </>
        )}

        {/* 進行中 */}
        {tool && !finished && (
          <div className="flex flex-col items-center gap-4 w-full">
            <h2 className="text-3xl font-display font-bold">{tool.icon} {tool.name}</h2>

            {/* 會呼吸的圓圈。大小走 inline style，低感官模式下沒有 transition 就變成一格一格跳，
                不會整個動不了。 */}
            <button
              type="button"
              aria-label={tool.hold ? '按住不要放' : '正在進行'}
              onPointerDown={() => tool.hold && setHolding(true)}
              onPointerUp={() => tool.hold && setHolding(false)}
              onPointerLeave={() => tool.hold && setHolding(false)}
              className="relative w-[260px] h-[260px] flex items-center justify-center rounded-full border-[6px] select-none"
              style={{
                borderColor: color,
                backgroundColor: `${color}1F`,
                transform: `scale(${tool.counting ? 1 : scale})`,
                transition: motion ? 'transform 900ms ease-in-out' : 'none',
              }}
            >
              <span className="text-8xl" aria-hidden="true">
                {tool.counting ? count : tool.icon}
              </span>
            </button>

            <p className="text-4xl font-display font-bold" style={{ color }}>
              {tool.counting ? `數到 ${count}` : step?.label}
            </p>
            {tool.hold && stepIdx === 0 && !holding && (
              <p className="text-2xl text-inkSoft">👆 按住上面的球不要放</p>
            )}
            {!tool.counting && (
              <p className="text-xl text-inkSoft">第 {round} 次／共 {tool.rounds} 次</p>
            )}

            <button type="button" onClick={reset} className="text-inkSoft text-lg underline">
              換一個
            </button>
          </div>
        )}

        {/* 做完了 */}
        {finished && (
          <div className="flex flex-col items-center gap-4 text-center animate-popIn w-full">
            <div className="text-7xl" aria-hidden="true">🌿</div>
            <h2 className="text-4xl font-display font-bold">做得很好！</h2>

            {/* 從日記進來的話，問問看現在幾分 —— 這是整個功能最有價值的一筆資料 */}
            {emotion && after == null && (
              <>
                <div className="flex items-center gap-3">
                  <p className="text-2xl">
                    現在的「<span className="font-bold" style={{ color }}>{emotion.name}</span>」有多少？
                  </p>
                  <SpeakButton text={`現在的${emotion.name}有多少？`} className="w-[56px] h-[56px] min-w-0 min-h-0 text-2xl" />
                </div>
                <div className="flex items-end justify-center gap-2 w-full">
                  {INTENSITY.map((lv) => (
                    <button
                      key={lv.v}
                      type="button"
                      aria-label={`${lv.label}，${lv.v}分`}
                      onClick={() => saveAfter(lv.v)}
                      className="card p-2 min-h-[104px] min-w-0 select-none flex flex-col items-center justify-end gap-1 flex-1 max-w-[132px] opacity-80"
                      style={{ borderColor: color, '--edge': color }}
                    >
                      <span className="block" style={{ width: `${Math.round(lv.scale * 72)}%` }}>
                        <EmotionFace emotion={emotion} size={96} className="w-full h-auto" />
                      </span>
                      <span className="text-2xl md:text-3xl font-bold tabular-nums" style={{ color }}>{lv.v}</span>
                      <span className="text-sm md:text-lg text-inkSoft leading-tight">{lv.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {after != null && (
              <div className="card p-4 text-2xl" style={{ '--edge': color }}>
                {after < params.intensity ? (
                  <p>
                    從 <b>{params.intensity}</b> 分變成 <b>{after}</b> 分了，
                    「{tool?.name}」對你有用！🌟
                  </p>
                ) : after === params.intensity ? (
                  <p>還是 <b>{after}</b> 分。沒關係，有時候需要多做幾次，或換一個方法試試。</p>
                ) : (
                  <p>現在是 <b>{after}</b> 分。跟大人說一聲，讓他陪你一下。</p>
                )}
                {saved && <p className="text-lg text-inkSoft mt-2">已經記在今天的心情裡了</p>}
              </div>
            )}

            <div className="flex flex-wrap gap-3 justify-center">
              <BigButton onClick={reset} color="#6FC2C0">🔁 再做一次</BigButton>
              <BigButton onClick={() => go('home')} color="#F3C14F">🏠 回家</BigButton>
            </div>
          </div>
        )}
      </div>
    </Screen>
  )
}
