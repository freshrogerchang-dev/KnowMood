import { useCallback, useEffect, useState } from 'react'
import Home from './screens/Home'
import Gallery from './screens/Gallery'
import MatchGame from './screens/MatchGame'
import Scenario from './screens/Scenario'
import CalmCorner from './screens/CalmCorner'
import VoiceEmotion from './screens/VoiceEmotion'
import Detective from './screens/Detective'
import WhereEmotion from './screens/WhereEmotion'
import Mimic from './screens/Mimic'
import Journal from './screens/Journal'
import Rewards from './screens/Rewards'
import ParentSettings from './screens/ParentSettings'
import { installSpeechUnlock, stopSpeaking } from './lib/speech'
import { useApp } from './lib/store'

const SCREENS = {
  home: Home,
  gallery: Gallery,
  match: MatchGame,
  scenario: Scenario,
  calm: CalmCorner,
  voice: VoiceEmotion,
  detective: Detective,
  where: WhereEmotion,
  mimic: Mimic,
  journal: Journal,
  rewards: Rewards,
  parent: ParentSettings,
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [params, setParams] = useState(null)
  const { settings } = useApp()

  // iPad 上第一次發聲一定要由觸控觸發，開機就先掛好解鎖用的監聽
  useEffect(() => {
    if (settings.speech !== false) installSpeechUnlock()
  }, [settings.speech])

  // 第二個參數讓畫面之間可以傳資料（例如日記把「什麼情緒、幾分」帶進冷靜角）
  const go = useCallback((name, nextParams = null) => {
    stopSpeaking() // 換頁時把上一句唸到一半的話停掉
    setScreen(name)
    setParams(nextParams)
    window.scrollTo(0, 0)
    if (name === 'home') window.history.replaceState({ screen: 'home', params: null }, '')
    else window.history.pushState({ screen: name, params: nextParams }, '')
  }, [])

  // 平板／手機的返回手勢回到主畫面，而不是直接離開 App
  useEffect(() => {
    window.history.replaceState({ screen: 'home' }, '')
    const onPop = (e) => {
      stopSpeaking()
      setScreen(e.state?.screen || 'home')
      setParams(e.state?.params || null)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const Current = SCREENS[screen] || Home
  return (
    <div className="min-h-[100dvh]">
      <Current go={go} params={params} />
    </div>
  )
}
