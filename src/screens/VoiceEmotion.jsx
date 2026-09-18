import { useCallback, useEffect, useMemo, useState } from 'react'
import { Screen, ProgressDots, BigButton } from '../components/UI'
import Icon from '../components/Icon'
import RoundEnd from '../components/RoundEnd'
import EmotionFace from '../components/EmotionFace'
import Ruby from '../components/Ruby'
import { activeEmotions } from '../data/emotions'
import { VOICE_LINES, VOICE_TONES, hasTone, TONE_CLUE } from '../data/voiceLines'
import { useApp } from '../lib/store'
import { speakSmart as speak, speakWithTone, speechSupported } from '../lib/speech'
import { recordedToneUrl, playRecordedTone } from '../lib/toneAudio'
import { sfx } from '../lib/sound'
import { buildRound, buildChoices } from '../lib/quiz'

// 聲音裡的情緒
// 同一句中性的話，用不同語調唸，讓孩子只靠「怎麼說」來判斷心情。
// 句子本身看不出答案，所以一定要聽 —— 這是刻意的。
export default function VoiceEmotion({ go }) {
  const { settings, addStars, recordAttempt } = useApp()

  // 只留聽得出差別的情緒；語音關掉或瀏覽器不支援就玩不了
  const pool = useMemo(
    () => activeEmotions(settings).filter((e) => hasTone(e.id)),
    [settings],
  )
  const usable = speechSupported() && settings.speech !== false && pool.length >= 2
  const len = settings.roundLength

  const [seed, setSeed] = useState(0)
  const round = useMemo(() => buildRound(pool, len), [pool, len, seed])
  const [qi, setQi] = useState(0)
  const [wrong, setWrong] = useState([])
  const [solved, setSolved] = useState(false)
  const [earned, setEarned] = useState(0)
  const [done, setDone] = useState(false)
  const [plays, setPlays] = useState(0)

  const answer = round[qi]
  const lineIndex = useMemo(() => Math.floor(Math.random() * VOICE_LINES.length), [qi, seed]) // eslint-disable-line react-hooks/exhaustive-deps
  const line = VOICE_LINES[lineIndex]
  const choices = useMemo(
    () => (answer ? buildChoices(answer, pool, settings.choices) : []),
    [answer, pool, settings.choices, qi, seed], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const play = useCallback(() => {
    if (!answer) return
    setPlays((n) => n + 1)
    if (settings.speech === false) return
    const tone = VOICE_TONES[answer.id]
    const url = recordedToneUrl(answer.id, lineIndex)
    // 有預錄音檔（Google TTS，比較自然）就優先播，沒有才 fallback 回瀏覽器語音
    if (!url || !playRecordedTone(url, tone.volume)) {
      speakWithTone(line, tone, settings)
    }
  }, [answer, line, lineIndex, settings])

  useEffect(() => {
    if (done || !usable || !answer) return
    const t = setTimeout(play, 500)
    return () => clearTimeout(t)
  }, [qi, done]) // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (c) => {
    if (solved) return
    if (c.id === answer.id) {
      setSolved(true)
      sfx.correct(settings)
      const first = wrong.length === 0
      if (first) { addStars(1); setEarned((n) => n + 1) }
      recordAttempt({ mode: 'voice', emotionId: answer.id, correct: first, tries: wrong.length + 1 })
      setTimeout(() => speak(`對了，他是${answer.name}的聲音。${TONE_CLUE[answer.id]}`, settings), 400)
    } else {
      sfx.retry(settings)
      setWrong((w) => [...w, c.id])
      setTimeout(play, 500) // 答錯就再唸一次，讓他再聽
    }
  }

  const next = () => {
    if (qi + 1 >= len) setDone(true)
    else { setQi((n) => n + 1); setWrong([]); setSolved(false); setPlays(0) }
  }

  const restart = () => {
    setSeed((s) => s + 1); setQi(0); setWrong([]); setSolved(false); setEarned(0); setDone(false); setPlays(0)
  }

  if (!usable) {
    return (
      <Screen title="聲音裡的情緒" onBack={() => go('home')}>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center max-w-xl mx-auto">
          <Icon name="mute" size={72} color="#B7AFA4" tint="#EEEAE4" />
          <h2 className="text-3xl font-display font-bold">這個遊戲需要語音</h2>
          <p className="text-xl text-inkSoft leading-relaxed">
            {!speechSupported()
              ? '這台裝置的瀏覽器不支援語音朗讀，換 Safari 或 Chrome 試試看。'
              : settings.speech === false
                ? '請到家長設定把「語音朗讀」打開。'
                : '目前開放的情緒不夠，請到家長設定調整。'}
          </p>
          <BigButton onClick={() => go('home')} color="#F3C14F"><Icon name="home" size={26} />回家</BigButton>
        </div>
      </Screen>
    )
  }

  if (done) {
    return (
      <Screen title="聲音裡的情緒" onBack={() => go('home')}>
        <RoundEnd earned={earned} total={len} onAgain={restart} onHome={() => go('home')} onRewards={() => go('rewards')} />
      </Screen>
    )
  }

  const hint = wrong.length >= 2

  return (
    <Screen title="聲音裡的情緒" onBack={() => go('home')}>
      <ProgressDots total={len} done={qi} />

      <div className="flex-1 flex flex-col items-center justify-center gap-5 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-center">
          他說話的聲音，是什麼心情？
        </h2>

        {/* 句子本身看不出答案，只能靠聽 */}
        <div className="card px-6 py-4" style={{ '--edge': '#C9B9E0', backgroundColor: '#F1ECF8' }}>
          <p className="text-3xl md:text-4xl font-display">「{line}」</p>
        </div>

        <button
          type="button"
          onClick={play}
          aria-label="再聽一次"
          className="tap card w-[150px] h-[150px] flex flex-col items-center justify-center gap-1"
          style={{ '--edge': '#9C8FC2', backgroundColor: '#EDE7F6' }}
        >
          <Icon name="speaker" size={56} color="#9C8FC2" />
          <span className="text-lg text-ink/70">再聽一次</span>
        </button>
        <p className="text-lg text-inkSoft">已經聽了 {plays} 次・想聽幾次都可以</p>

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
                <EmotionFace emotion={c} size={120} className="w-full h-auto max-w-[120px]" />
                <span className="text-2xl font-bold" style={{ color: c.color }}>
                  <Ruby text={c.name} zhuyin={c.zhuyin} show={settings.zhuyin} />
                </span>
              </button>
            )
          })}
        </div>

        {solved ? (
          <div className="flex flex-col items-center gap-3 animate-popIn">
            <div className="card p-4 max-w-2xl text-xl md:text-2xl leading-relaxed flex items-center gap-2"
              style={{ '--edge': answer.color }}>
              <Icon name="ear" size={28} className="shrink-0" />{TONE_CLUE[answer.id]}
            </div>
            <BigButton onClick={next} color="#93C08A">
              {qi + 1 >= len ? <>看看拿到幾顆星星<Icon name="star" size={26} color="#D8AE57" /></> : '下一題 ▶'}
            </BigButton>
          </div>
        ) : (
          wrong.length > 0 && <p className="text-xl text-inkSoft flex items-center justify-center gap-1">沒關係，再聽一次看看<Icon name="ear" size={20} /></p>
        )}
      </div>
    </Screen>
  )
}
