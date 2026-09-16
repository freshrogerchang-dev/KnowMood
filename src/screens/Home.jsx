import { useEffect } from 'react'
import { useApp } from '../lib/store'
import { speak } from '../lib/speech'
import { StarBadge, HoldToEnter } from '../components/UI'
import EmotionFace from '../components/EmotionFace'
import { activeEmotions } from '../data/emotions'

const MODES = [
  { id: 'gallery', icon: '📚', title: '情緒圖鑑', desc: '看看每種心情長什麼樣子', color: '#F3C14F' },
  { id: 'match', icon: '🎯', title: '配對遊戲', desc: '找出正確的表情', color: '#6FC2C0' },
  { id: 'scenario', icon: '🧩', title: '情境猜猜看', desc: '他現在是什麼心情？', color: '#7FA9D4' },
  { id: 'mimic', icon: '🪞', title: '表情模仿', desc: '照著做做看', color: '#EDA5B6' },
  { id: 'journal', icon: '📔', title: '今天的心情', desc: '說說今天發生的事', color: '#93C08A' },
  { id: 'rewards', icon: '🎁', title: '我的貼紙簿', desc: '看看收集到的貼紙', color: '#A99BD4' },
]

export default function Home({ go }) {
  const { state, settings } = useApp()
  const pool = activeEmotions(settings)

  useEffect(() => {
    const hi = state.childName ? `${state.childName}，我們來玩情緒遊戲！` : '我們來玩情緒遊戲！'
    const t = setTimeout(() => speak(hi, settings), 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-[100dvh] flex flex-col px-4 py-4">
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <EmotionFace emotion={pool[0]} size={64} animate />
          <div>
            <h1 className="text-3xl font-bold leading-tight">認識情緒</h1>
            <p className="text-inkSoft">
              {state.childName ? `哈囉，${state.childName}！` : '今天想玩什麼呢？'}
            </p>
          </div>
        </div>
        <StarBadge />
      </header>

      <div className="grid grid-cols-2 gap-3 md:gap-4 flex-1 content-start">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => go(m.id)}
            className="tap card p-4 md:p-5 flex flex-col items-center justify-center gap-1 text-center active:translate-y-[2px]"
            style={{ borderColor: m.color, backgroundColor: `${m.color}14` }}
          >
            <span className="text-5xl md:text-6xl" aria-hidden="true">{m.icon}</span>
            <span className="text-xl md:text-2xl font-bold">{m.title}</span>
            <span className="text-sm text-inkSoft hidden md:block">{m.desc}</span>
          </button>
        ))}
      </div>

      <footer className="pt-4 flex justify-center">
        <HoldToEnter onDone={() => go('parent')} className="text-inkSoft">
          👨‍👩‍👧 長按 2 秒進入家長設定
        </HoldToEnter>
      </footer>
    </div>
  )
}
