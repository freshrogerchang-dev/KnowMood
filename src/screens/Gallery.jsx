import { useEffect, useState } from 'react'
import { Screen, SpeakButton } from '../components/UI'
import EmotionFace from '../components/EmotionFace'
import Ruby from '../components/Ruby'
import { activeEmotions } from '../data/emotions'
import { useApp } from '../lib/store'
import { speak } from '../lib/speech'
import { sfx } from '../lib/sound'

const TABS = [
  { id: 'body', label: '身體訊號', icon: '👀', key: 'bodyClue' },
  { id: 'say', label: '我可以說', icon: '💬', key: 'iSay' },
  { id: 'do', label: '我可以做', icon: '🤝', key: 'cope' },
]

export default function Gallery({ go }) {
  const { settings } = useApp()
  const pool = activeEmotions(settings)
  const [i, setI] = useState(0)
  const [tab, setTab] = useState('body')
  const e = pool[Math.min(i, pool.length - 1)]

  useEffect(() => { speak(e.name, settings) }, [e.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const move = (d) => {
    sfx.tap(settings)
    setI((prev) => (prev + d + pool.length) % pool.length)
  }

  return (
    <Screen title="情緒圖鑑" onBack={() => go('home')}>
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2 md:gap-4 w-full justify-center">
          <button type="button" onClick={() => move(-1)} aria-label="上一個情緒"
            className="tap card w-[72px] h-[72px] min-w-0 min-h-0 text-4xl flex items-center justify-center">◀</button>

          <button
            type="button"
            onClick={() => speak(e.name, settings)}
            className="rounded-blob p-2 active:scale-[0.98] transition-transform"
            style={{ backgroundColor: `${e.color}1A` }}
            aria-label={`播放「${e.name}」`}
          >
            <EmotionFace emotion={e} size={240} animate className="max-w-[50vw] h-auto" />
          </button>

          <button type="button" onClick={() => move(1)} aria-label="下一個情緒"
            className="tap card w-[72px] h-[72px] min-w-0 min-h-0 text-4xl flex items-center justify-center">▶</button>
        </div>

        <div className="flex items-center gap-4">
          <h2 className="text-5xl md:text-6xl font-bold" style={{ color: e.color }}>
            <Ruby text={e.name} zhuyin={e.zhuyin} show={settings.zhuyin} />
          </h2>
          <SpeakButton text={e.name} className="w-[64px] h-[64px] min-w-0 min-h-0 text-3xl" />
        </div>

        <div className="w-full max-w-2xl">
          <div className="flex gap-2 justify-center mb-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => { sfx.tap(settings); setTab(t.id); speak(e[t.key], settings) }}
                className={`tap min-h-0 h-[60px] px-4 rounded-2xl border-2 text-lg font-bold flex items-center gap-2 ${
                  tab === t.id ? 'bg-paper' : 'bg-transparent border-line text-inkSoft'
                }`}
                style={tab === t.id ? { borderColor: e.color } : undefined}
              >
                <span aria-hidden="true">{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
          <div className="card p-5 text-2xl leading-relaxed flex items-center gap-4">
            <p className="flex-1">{e[TABS.find((t) => t.id === tab).key]}</p>
            <SpeakButton text={e[TABS.find((t) => t.id === tab).key]} className="w-[64px] h-[64px] min-w-0 min-h-0 text-3xl shrink-0" />
          </div>
        </div>

        <div className="flex gap-2">
          {pool.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              aria-label={p.name}
              onClick={() => { sfx.tap(settings); setI(idx) }}
              className={`w-4 h-4 rounded-full border-2 ${idx === i ? '' : 'bg-paper'}`}
              style={{ borderColor: p.color, backgroundColor: idx === i ? p.color : undefined }}
            />
          ))}
        </div>
      </div>
    </Screen>
  )
}
