import { useEffect } from 'react'
import { useApp } from '../lib/store'
import { speakSmart as speak } from '../lib/speech'
import { StarBadge, HoldToEnter } from '../components/UI'
import EmotionFace from '../components/EmotionFace'
import Icon from '../components/Icon'
import { activeEmotions } from '../data/emotions'

// 每張卡片有自己的色系（低飽和、彼此分得開），右下角壓一個半透明的表情當背景，
// 讓六個模式一眼就能用顏色 + 表情記住，不用先讀字。
const MODES = [
  { id: 'gallery',   icon: 'gallery',   title: '情緒圖鑑',     desc: '看看每種心情長什麼樣子', bg: '#EFD9A0', edge: '#C9A35C', ghost: 'happy' },
  { id: 'where',     icon: 'where',     title: '情緒在哪裡？', desc: '身體會有什麼反應',       bg: '#BFDCD8', edge: '#7BAFAA', ghost: 'calm' },
  { id: 'bodylang',  icon: 'jump',      title: '動作猜心情',   desc: '看動作猜猜是什麼心情',   bg: '#C7E0C9', edge: '#5C9E76', ghost: 'happy' },
  { id: 'match',     icon: 'match',     title: '配對遊戲',     desc: '找出正確的表情',         bg: '#BFD4E8', edge: '#7E9DBC', ghost: 'surprised' },
  { id: 'scenario',  icon: 'scenario',  title: '情境猜猜看',   desc: '他現在是什麼心情？',     bg: '#D3CBE8', edge: '#9C8FC2', ghost: 'sad' },
  { id: 'detective', icon: 'detective', title: '情緒小偵探',   desc: '找線索，猜心情有多強',   bg: '#E4D3BC', edge: '#B99A75', ghost: 'scared' },
  { id: 'voice',     icon: 'voice',     title: '聲音裡的情緒', desc: '聽聽看他是什麼心情',     bg: '#E0D8EC', edge: '#9C8FC2', ghost: 'tired' },
  { id: 'family',    icon: 'family',    title: '真人表情',     desc: '看看家人的表情',         bg: '#E8D7C3', edge: '#B99A75', ghost: 'sad' },
  { id: 'mimic',     icon: 'mimic',     title: '表情模仿',     desc: '照著做做看',             bg: '#EFC7B6', edge: '#C68E75', ghost: 'angry' },
  { id: 'journal',   icon: 'journal',   title: '今天的心情',   desc: '說說今天發生的事',       bg: '#C4DCBC', edge: '#86AB7C', ghost: 'shy' },
  { id: 'calm',      icon: 'calm',      title: '冷靜角',       desc: '心情太大的時候來這裡',   bg: '#DCE4DA', edge: '#93A88C', ghost: 'happy' },
  { id: 'rewards',   icon: 'rewards',   title: '我的貼紙簿',   desc: '看看收集到的貼紙',       bg: '#EFC9D6', edge: '#C48EA3', ghost: 'happy' },
]

export default function Home({ go }) {
  const { state, settings } = useApp()
  const pool = activeEmotions(settings)

  useEffect(() => {
    const hi = state.childName ? '哈囉，我們來玩情緒遊戲！' : '我們來玩情緒遊戲！'
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
            <h1 className="text-4xl font-display font-bold leading-tight">認識情緒</h1>
            <p className="text-inkSoft">
              {state.childName ? `哈囉，${state.childName}！` : '今天想玩什麼呢？'}
            </p>
          </div>
        </div>
        <StarBadge />
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1 auto-rows-fr">
        {MODES.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => go(m.id)}
            className={`tap card relative overflow-hidden p-4 md:p-5 flex flex-col items-center justify-center gap-1 text-center ${
              i % 2 ? 'blob-b' : 'blob-a'
            }`}
            style={{ borderColor: m.edge, '--edge': m.edge, backgroundColor: m.bg }}
          >
            {/* 右下角的幽靈表情：被卡片裁掉一半，當成該模式的情緒標記 */}
            <EmotionFace
              emotion={m.ghost}
              size={128}
              className="pointer-events-none absolute -right-9 -bottom-10 opacity-[0.28] rotate-[8deg]"
            />
            <Icon name={m.icon} size={56} color={m.edge} tint={m.bg} className="relative" />
            <span className="relative text-xl md:text-2xl font-display font-bold">{m.title}</span>
            <span className="relative text-sm text-ink/70 hidden md:block">{m.desc}</span>
          </button>
        ))}
      </div>

      <footer className="pt-4 flex justify-center">
        <HoldToEnter onDone={() => go('parent')} className="text-inkSoft">
          <span className="inline-flex items-center gap-1"><Icon name="family" size={20} />長按 2 秒進入家長設定</span>
        </HoldToEnter>
      </footer>
    </div>
  )
}
