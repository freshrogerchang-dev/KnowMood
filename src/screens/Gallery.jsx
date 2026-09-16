import { useEffect, useState } from 'react'
import { Screen, SpeakButton } from '../components/UI'
import EmotionFace from '../components/EmotionFace'
import Ruby from '../components/Ruby'
import { activeEmotions } from '../data/emotions'
import { wordsOf } from '../data/vocabulary'
import { useApp } from '../lib/store'
import { speak } from '../lib/speech'
import { sfx } from '../lib/sound'

const BASE_TABS = [
  { id: 'body', label: '身體訊號', icon: '👀', key: 'bodyClue' },
  { id: 'say', label: '我可以說', icon: '💬', key: 'iSay' },
  { id: 'do', label: '我可以做', icon: '🤝', key: 'cope' },
]
// 詞彙分頁：同一個情緒、由弱到強的不同說法
const WORDS_TAB = { id: 'words', label: '還可以這樣說', icon: '🗣️' }

export default function Gallery({ go }) {
  const { settings } = useApp()
  const pool = activeEmotions(settings)
  const [i, setI] = useState(0)
  const [tab, setTab] = useState('body')
  const e = pool[Math.min(i, pool.length - 1)]
  const words = settings.richVocab === false ? [] : wordsOf(e.id)
  const tabs = words.length ? [...BASE_TABS, WORDS_TAB] : BASE_TABS
  const activeTab = tabs.find((t) => t.id === tab) || tabs[0]

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
            <EmotionFace emotion={e} size={activeTab.id === 'words' ? 130 : 240} animate className="max-w-[50vw] h-auto" />
          </button>

          <button type="button" onClick={() => move(1)} aria-label="下一個情緒"
            className="tap card w-[72px] h-[72px] min-w-0 min-h-0 text-4xl flex items-center justify-center">▶</button>
        </div>

        <div className="flex items-center gap-4">
          <h2 className={`${activeTab.id === 'words' ? 'text-4xl' : 'text-5xl md:text-6xl'} font-bold`} style={{ color: e.color }}>
            <Ruby text={e.name} zhuyin={e.zhuyin} show={settings.zhuyin} />
          </h2>
          <SpeakButton text={e.name} className="w-[64px] h-[64px] min-w-0 min-h-0 text-3xl" />
        </div>

        <div className="w-full max-w-2xl">
          <div className="flex flex-wrap gap-2 justify-center mb-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  sfx.tap(settings)
                  setTab(t.id)
                  if (t.key) speak(e[t.key], settings)
                  else speak(`${e.name}還可以說成：${words.map((w) => w.word).join('、')}`, settings)
                }}
                className={`tap min-h-0 h-[60px] px-4 rounded-2xl border-2 text-lg font-bold flex items-center gap-2 ${
                  tab === t.id ? 'bg-paper' : 'bg-transparent border-line text-inkSoft'
                }`}
                style={tab === t.id ? { borderColor: e.color } : undefined}
              >
                <span aria-hidden="true">{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
          {activeTab.id === 'words' ? (
            <div className="card p-4">
              <p className="text-lg text-inkSoft mb-3 text-center">
                同樣是「{e.name}」，從一點點到非常多，可以這樣說 👇
              </p>
              <div className="flex flex-col gap-2">
                {words.map((w, idx) => (
                  <button
                    key={w.word}
                    type="button"
                    aria-label={w.word}
                    onClick={() => { sfx.tap(settings); speak(`${w.word}。${w.when}`, settings) }}
                    className="tap min-h-0 w-full text-left rounded-2xl border-2 px-4 py-3 flex items-center gap-3 active:translate-y-[2px]"
                    style={{ borderColor: e.color, backgroundColor: `${e.color}${['0D', '14', '1F', '29', '33', '3D'][idx] || '33'}` }}
                  >
                    {/* 強度條：愈往下顏色愈滿，把「程度」變成看得見的東西 */}
                    <span className="flex flex-col gap-[3px] shrink-0" aria-hidden="true">
                      {[5, 4, 3, 2, 1].map((lv) => (
                        <span
                          key={lv}
                          className="block h-[4px] rounded-full"
                          style={{
                            width: `${10 + lv * 4}px`,
                            backgroundColor: lv >= w.band[0] && lv <= w.band[1] ? e.color : '#E8E0D4',
                          }}
                        />
                      ))}
                    </span>
                    <span className="text-3xl font-bold shrink-0" style={{ color: e.color }}>
                      <Ruby text={w.word} zhuyin={w.zhuyin} show={settings.zhuyin} />
                    </span>
                    <span className="flex-1 text-lg leading-snug">{w.when}</span>
                    <span className="text-2xl shrink-0" aria-hidden="true">🔊</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-5 text-2xl leading-relaxed flex items-center gap-4">
              <p className="flex-1">{e[activeTab.key]}</p>
              <SpeakButton text={e[activeTab.key]} className="w-[64px] h-[64px] min-w-0 min-h-0 text-3xl shrink-0" />
            </div>
          )}
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
