import { useEffect, useRef, useState } from 'react'
import { useApp } from '../lib/store'
import { speakSmart as speak, stopSpeaking } from '../lib/speech'
import { sfx } from '../lib/sound'
import Icon from './Icon'

/** 大按鈕：至少 88px，按下去會往下沉一點，給明確的觸覺回饋 */
export function BigButton({ children, onClick, className = '', color = '#F3C14F', mute = false, ...rest }) {
  const { settings } = useApp()
  return (
    <button
      type="button"
      onClick={(e) => {
        if (!mute) sfx.tap(settings)
        onClick?.(e)
      }}
      className={`tap card px-6 py-4 text-2xl font-bold flex items-center justify-center gap-3 hover:brightness-[0.99] ${className}`}
      style={{ borderColor: color, '--edge': color}}
      {...rest}
    >
      {children}
    </button>
  )
}

/** 喇叭按鈕：把畫面上的字唸出來 */
export function SpeakButton({ text, className = '', label = '再聽一次' }) {
  const { settings } = useApp()
  if (settings.speech === false) return null
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => speak(text, settings)}
      className={`tap card w-[88px] h-[88px] flex items-center justify-center ${className}`}
    >
      <Icon name="speaker" size={40} />
    </button>
  )
}

export function StarBadge({ className = '' }) {
  const { state } = useApp()
  return (
    <div
      className={`sticker card blob-b px-4 py-2 flex items-center gap-2 text-2xl font-bold ${className}`}
      style={{ '--edge': '#D8AE57', backgroundColor: '#FBEFCF' }}
      aria-label={`星星 ${state.stars} 顆`}
    >
      <Icon name="star" size={26} color="#D8AE57" />
      <span className="tabular-nums">{state.stars}</span>
    </div>
  )
}

/** 每個畫面共用的外框：左上角一律是「回家」，位置固定不會變 */
export function Screen({ title, onBack, right, children, bg = 'bg-cream', backIcon = 'home', backLabel = '回到主畫面' }) {
  useEffect(() => () => stopSpeaking(), [])
  return (
    <div className={`min-h-[100dvh] flex flex-col ${bg}`}>
      <header className="flex items-center justify-between gap-3 px-4 py-3 shrink-0">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label={backLabel}
            className="tap card w-[72px] h-[72px] min-w-0 min-h-0 flex items-center justify-center"
          >
            <Icon name={backIcon} size={32} />
          </button>
        ) : (
          <span className="w-[72px]" />
        )}
        <h1 className="text-2xl md:text-3xl font-display font-bold truncate">{title}</h1>
        <div className="min-w-[72px] flex justify-end">{right ?? <StarBadge />}</div>
      </header>
      <main className="flex-1 px-4 pb-6 flex flex-col">{children}</main>
    </div>
  )
}

/** 進度點點：讓孩子看得到「還剩幾題」，減少不確定感 */
export function ProgressDots({ total, done }) {
  return (
    <div className="flex items-center justify-center gap-2" aria-label={`第 ${done + 1} 題，共 ${total} 題`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`w-4 h-4 rounded-full border-2 ${i < done ? 'bg-happy border-happy' : 'border-line bg-paper'}`}
        />
      ))}
    </div>
  )
}

/**
 * 家長門檻：長按 2 秒才進得去設定頁，避免小朋友誤觸。
 * 刻意不用數學題 —— 家長常常單手抱小孩，長按最快。
 */
export function HoldToEnter({ onDone, children, className = '', seconds = 2 }) {
  const [progress, setProgress] = useState(0)
  const timer = useRef(null)
  const start = useRef(0)

  const begin = () => {
    start.current = Date.now()
    clearInterval(timer.current)
    timer.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - start.current) / (seconds * 1000))
      setProgress(p)
      if (p >= 1) {
        clearInterval(timer.current)
        setProgress(0)
        onDone()
      }
    }, 50)
  }
  const cancel = () => {
    clearInterval(timer.current)
    setProgress(0)
  }
  useEffect(() => () => clearInterval(timer.current), [])

  return (
    <button
      type="button"
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      className={`relative overflow-hidden tap card px-5 py-3 text-lg ${className}`}
    >
      <span
        className="absolute inset-y-0 left-0 bg-line/70"
        style={{ width: `${progress * 100}%`, transition: 'width 50ms linear' }}
      />
      <span className="relative">{children}</span>
    </button>
  )
}
