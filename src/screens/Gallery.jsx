import { useEffect, useState } from 'react'
import { Screen, SpeakButton } from '../components/UI'
import Icon from '../components/Icon'
import EmotionFace from '../components/EmotionFace'
import Ruby from '../components/Ruby'
import { activeEmotions } from '../data/emotions'
import { wordsOf } from '../data/vocabulary'
import { useApp } from '../lib/store'
import { speakSmart as speak } from '../lib/speech'
import { sfx } from '../lib/sound'

const BASE_TABS = [
  { id: 'body', label: '身體訊號', icon: 'eye', key: 'bodyClue' },
  { id: 'say', label: '我可以說', icon: 'speech', key: 'iSay' },
  { id: 'do', label: '我可以做', icon: 'thumbsUp', key: 'cope' },
]
// 詞彙分頁：同一個情緒、由弱到強的不同說法
const WORDS_TAB = { id: 'words', label: '還可以這樣說', icon: 'speech' }

export default function Gallery({ go }) {
  const { settings } = useApp()
  const pool = activeEmotions(settings)
  const [i, setI] = useState(0)
  const [tab, setTab] = useState('body')
  const [openWord, setOpenWord] = useState(null)
  const e = pool[Math.min(i, pool.length - 1)]
  const words = settings.richVocab === false ? [] : wordsOf(e.id)
  const tabs = words.length ? [...BASE_TABS, WORDS_TAB] : BASE_TABS
  const activeTab = tabs.find((t) => t.id === tab) || tabs[0]

  useEffect(() => { setOpenWord(null) }, [e.id, tab])
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
            <EmotionFace emotion={e} size={activeTab.id === 'words' ? 108 : 240} animate className="max-w-[50vw] h-auto" />
          </button>

          <button type="button" onClick={() => move(1)} aria-label="下一個情緒"
            className="tap card w-[72px] h-[72px] min-w-0 min-h-0 text-4xl flex items-center justify-center">▶</button>
        </div>

        {/* 詞彙分頁時不再重複顯示情緒名稱 —— 下面那句提示已經說了「同樣是『開心』」，
            把垂直空間讓給詞彙清單，一次看得到比較多個詞。 */}
        {activeTab.id !== 'words' && (
          <div className="flex items-center gap-4">
            <h2 className="text-5xl md:text-6xl font-bold" style={{ color: e.color }}>
              <Ruby text={e.name} zhuyin={e.zhuyin} show={settings.zhuyin} />
            </h2>
            <SpeakButton text={e.name} className="w-[64px] h-[64px] min-w-0 min-h-0 text-3xl" />
          </div>
        )}

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
                style={tab === t.id ? { borderColor: e.color, '--edge': e.color} : undefined}
              >
                <Icon name={t.icon} size={22} />{t.label}
              </button>
            ))}
          </div>
          {activeTab.id === 'words' ? (
            <div className="card p-4">
              <p className="text-lg text-inkSoft mb-3 text-center">
                同樣是「{e.name}」，從一點點到非常多，可以這樣說
              </p>
              {/* 手風琴：預設只顯示詞，點了才展開「什麼時候用」——
                  一次只開一個，整張清單才不會又變長。 */}
              <div className="flex flex-col gap-2">
                {words.map((w, idx) => {
                  const isOpen = openWord === w.word
                  return (
                    <div
                      key={w.word}
                      className="rounded-2xl border-2 overflow-hidden"
                      style={{ borderColor: e.color, '--edge': e.color, backgroundColor: `${e.color}${['0D', '14', '1F', '29', '33', '3D'][idx] || '33'}` }}
                    >
                      <button
                        type="button"
                        aria-label={w.word}
                        aria-expanded={isOpen}
                        onClick={() => {
                          sfx.tap(settings)
                          const next = isOpen ? null : w.word
                          setOpenWord(next)
                          speak(next ? `${w.word}。${w.when}` : w.word, settings)
                        }}
                        className="tap min-h-0 w-full text-left px-4 py-3 flex items-center gap-3 active:translate-y-[2px]"
                      >
                        {/* 強度條：把「程度」變成看得見的東西 */}
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
                        <span className="flex-1" />
                        <Icon name="speaker" size={26} className="shrink-0" />
                        <span
                          className="text-xl shrink-0 transition-transform"
                          style={{ transform: isOpen ? 'rotate(90deg)' : 'none', color: e.color }}
                          aria-hidden="true"
                        >
                          ▶
                        </span>
                      </button>
                      {isOpen && (
                        <p className="px-4 pb-3 text-lg leading-snug animate-popIn">{w.when}</p>
                      )}
                    </div>
                  )
                })}
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
              style={{ borderColor: p.color, '--edge': p.color, backgroundColor: idx === i ? p.color : undefined }}
            />
          ))}
        </div>
      </div>
    </Screen>
  )
}
