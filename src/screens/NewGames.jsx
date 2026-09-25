import { useEffect, useMemo, useState } from 'react'
import { Screen, ProgressDots, SpeakButton, BigButton } from '../components/UI'
import EmotionFace from '../components/EmotionFace'
import ScenarioIcon from '../components/ScenarioIcon'
import RoundEnd from '../components/RoundEnd'
import { activeEmotions, getEmotion } from '../data/emotions'
import { scenariosFor } from '../data/scenarios'
import { COPING_ROUNDS, SOCIAL_STORIES } from '../data/newGames'
import { buildChoices, shuffle } from '../lib/quiz'
import { useApp } from '../lib/store'
import { speakSmart as speak } from '../lib/speech'
import { sfx } from '../lib/sound'

function Choice({ children, onClick, disabled, right, wrong }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={`tap card p-4 text-xl md:text-2xl font-bold min-h-24 ${wrong ? 'opacity-25' : ''} ${right ? 'ring-4 ring-green-400' : ''}`}>{children}</button>
}

export function CopeGame({ go }) {
  const app = useApp(); const { settings } = app
  const pool = useMemo(() => activeEmotions(settings), [settings])
  const round = useMemo(() => shuffle(COPING_ROUNDS.filter(q => pool.some(e => e.id === q.emotionId))).slice(0, Math.min(settings.roundLength, 6)), [pool, settings.roundLength])
  const [qi,setQi]=useState(0), [phase,setPhase]=useState('emotion'), [wrong,setWrong]=useState([]), [solved,setSolved]=useState(false), [earned,setEarned]=useState(0)
  const q=round[qi], emotion=getEmotion(q?.emotionId)
  const emotions=useMemo(()=>emotion?buildChoices(emotion,pool,Math.max(2,settings.choices)):[],[emotion,pool,settings.choices,qi]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(()=>{ if(q) { const text=phase==='emotion'?`${q.text} 他現在是什麼心情？`:'現在可以怎麼做，讓自己安全又舒服一點？'; const t=setTimeout(()=>speak(text,settings),250); return()=>clearTimeout(t)} },[qi,phase]) // eslint-disable-line react-hooks/exhaustive-deps
  if(!q) return <Screen title="那怎麼辦？" onBack={()=>go('home')}><RoundEnd earned={earned} total={round.length} onAgain={()=>{setQi(0);setPhase('emotion');setWrong([]);setSolved(false);setEarned(0)}} onHome={()=>go('home')} onRewards={()=>go('rewards')}/></Screen>
  const pickEmotion=(c)=>{if(c.id===emotion.id){setPhase('cope');setWrong([]);sfx.correct(settings);speak(`對，他覺得${emotion.name}。`,settings)}else{setWrong(w=>[...w,c.id]);sfx.retry(settings)}}
  const pickCope=(i)=>{if(solved)return;if(i===q.answer){const first=wrong.length===0;setSolved(true);if(first){app.addStars(1);setEarned(n=>n+1)}app.recordAttempt({mode:'cope',emotionId:emotion.id,correct:first,tries:wrong.length+1});sfx.correct(settings);speak('這個做法能照顧自己，也不會傷害別人。',settings)}else{setWrong(w=>[...w,i]);sfx.retry(settings);speak('再想想看，要讓自己和別人都安全。',settings)}}
  const next=()=>{setQi(n=>n+1);setPhase('emotion');setWrong([]);setSolved(false)}
  return <Screen title="那怎麼辦？" onBack={()=>go('home')}><ProgressDots total={round.length} done={qi}/><div className="flex-1 flex flex-col items-center justify-center gap-4"><div className="card max-w-3xl w-full p-5 flex items-center gap-4"><ScenarioIcon name={q.icon} size={88}/><p className="text-2xl flex-1">{q.text}</p><SpeakButton text={q.text}/></div>{phase==='emotion'?<><h2 className="text-3xl font-bold">他現在是什麼心情？</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl">{emotions.map(c=><Choice key={c.id} wrong={wrong.includes(c.id)} disabled={wrong.includes(c.id)} onClick={()=>pickEmotion(c)}><EmotionFace emotion={c} size={110} className="mx-auto"/>{c.name}</Choice>)}</div></>:<><div className="flex items-center gap-3"><EmotionFace emotion={emotion} size={110}/><h2 className="text-3xl font-bold">可以怎麼做？</h2></div><div className="grid md:grid-cols-3 gap-3 w-full max-w-5xl">{q.choices.map((c,i)=><Choice key={c} wrong={wrong.includes(i)} right={solved&&i===q.answer} disabled={solved||wrong.includes(i)} onClick={()=>pickCope(i)}>{c}</Choice>)}</div>{solved&&<BigButton onClick={next}>{qi+1===round.length?'看星星':'下一題 ▶'}</BigButton>}</>}</div></Screen>
}

export function EyesGame({ go }) {
  const app=useApp(), {settings}=app, pool=useMemo(()=>activeEmotions(settings),[settings]), len=settings.roundLength
  const round=useMemo(()=>shuffle(pool).concat(shuffle(pool)).slice(0,len),[pool,len]), [qi,setQi]=useState(0), [wrong,setWrong]=useState([]), [earned,setEarned]=useState(0)
  const answer=round[qi], choices=useMemo(()=>answer?buildChoices(answer,pool,settings.choices):[],[answer,pool,settings.choices,qi]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(()=>{if(answer){const t=setTimeout(()=>speak('只看眼睛和眉毛，猜猜他是什麼心情。',settings),250);return()=>clearTimeout(t)}},[qi]) // eslint-disable-line react-hooks/exhaustive-deps
  if(!answer)return <Screen title="看眼睛猜心情" onBack={()=>go('home')}><RoundEnd earned={earned} total={len} onAgain={()=>{setQi(0);setWrong([]);setEarned(0)}} onHome={()=>go('home')} onRewards={()=>go('rewards')}/></Screen>
  const pick=c=>{if(c.id===answer.id){const first=!wrong.length;if(first){app.addStars(1);setEarned(n=>n+1)}app.recordAttempt({mode:'eyes',emotionId:answer.id,correct:first,tries:wrong.length+1});sfx.correct(settings);speak(`對了，這是${answer.name}的眼睛。`,settings);setTimeout(()=>{setQi(n=>n+1);setWrong([])},1100)}else{setWrong(w=>[...w,c.id]);sfx.retry(settings)}}
  return <Screen title="看眼睛猜心情" onBack={()=>go('home')}><ProgressDots total={len} done={qi}/><div className="flex-1 flex flex-col items-center justify-center gap-5"><h2 className="text-3xl font-bold">只看眼睛和眉毛</h2><div className="card overflow-hidden h-28 w-64 flex justify-center items-start"><EmotionFace emotion={answer} size={250} className="-translate-y-8 max-w-none"/></div><div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl">{choices.map(c=><Choice key={c.id} wrong={wrong.includes(c.id)} disabled={wrong.includes(c.id)} onClick={()=>pick(c)}>{c.name}</Choice>)}</div></div></Screen>
}

export function SocialStories({ go }) {
  const app=useApp(), {settings}=app, [storyIndex,setStoryIndex]=useState(0), [step,setStep]=useState(0), [earned,setEarned]=useState(0)
  const story=SOCIAL_STORIES[storyIndex], current=story?.steps[step]
  useEffect(()=>{if(current){const t=setTimeout(()=>speak(current[1],settings),200);return()=>clearTimeout(t)}},[storyIndex,step]) // eslint-disable-line react-hooks/exhaustive-deps
  if(!story)return <Screen title="社交小故事" onBack={()=>go('home')}><RoundEnd earned={earned} total={SOCIAL_STORIES.length} onAgain={()=>{setStoryIndex(0);setStep(0);setEarned(0)}} onHome={()=>go('home')} onRewards={()=>go('rewards')}/></Screen>
  const next=()=>{if(step+1<story.steps.length)setStep(n=>n+1);else{app.addStars(1);setEarned(n=>n+1);app.recordAttempt({mode:'social',emotionId:story.emotionId,correct:true,tries:1});sfx.correct(settings);speak('故事說完了，你做得很好！',settings);setTimeout(()=>{setStoryIndex(n=>n+1);setStep(0)},1000)}}
  return <Screen title="社交小故事" onBack={()=>go('home')}><ProgressDots total={story.steps.length} done={step}/><div className="flex-1 flex flex-col items-center justify-center gap-5"><h2 className="text-3xl font-bold">{story.title}</h2><div className="card max-w-3xl w-full p-8 flex flex-col items-center gap-5"><ScenarioIcon name={current[0]} size={130}/><p className="text-3xl text-center leading-relaxed">{current[1]}</p><SpeakButton text={current[1]}/></div><BigButton onClick={next}>{step+1===story.steps.length?'故事完成':'下一步 ▶'}</BigButton></div></Screen>
}

export function MemoryPairs({ go }) {
  const app=useApp(), {settings}=app, pool=useMemo(()=>shuffle(activeEmotions(settings)).slice(0,Math.min(4,activeEmotions(settings).length)),[settings])
  const [seed,setSeed]=useState(0), deck=useMemo(()=>shuffle(pool.flatMap(e=>[{key:`${e.id}-face`,id:e.id,type:'face'},{key:`${e.id}-name`,id:e.id,type:'name'}])),[pool,seed])
  const [open,setOpen]=useState([]), [matched,setMatched]=useState([]), [tries,setTries]=useState({}), done=matched.length===pool.length
  useEffect(()=>{const t=setTimeout(()=>speak('翻開兩張卡，找出一樣的心情。',settings),250);return()=>clearTimeout(t)},[]) // eslint-disable-line react-hooks/exhaustive-deps
  const flip=card=>{if(open.length===2||open.some(c=>c.key===card.key)||matched.includes(card.id))return;const next=[...open,card];setOpen(next);if(next.length===2){const id=next[0].id,setCount=(tries[id]||0)+1;setTries(x=>({...x,[id]:setCount}));if(next[0].id===next[1].id){setMatched(m=>[...m,id]);app.addStars(1);app.recordAttempt({mode:'memory',emotionId:id,correct:setCount===1,tries:setCount});sfx.correct(settings);setTimeout(()=>setOpen([]),600)}else{sfx.retry(settings);setTimeout(()=>setOpen([]),900)}}}
  const restart=()=>{setSeed(n=>n+1);setOpen([]);setMatched([]);setTries({})}
  if(done)return <Screen title="翻牌配對" onBack={()=>go('home')}><RoundEnd earned={matched.length} total={pool.length} onAgain={restart} onHome={()=>go('home')} onRewards={()=>go('rewards')}/></Screen>
  return <Screen title="翻牌配對" onBack={()=>go('home')}><div className="flex-1 grid grid-cols-3 md:grid-cols-4 gap-3 max-w-4xl w-full mx-auto content-center">{deck.map(card=>{const shown=open.some(c=>c.key===card.key)||matched.includes(card.id),e=getEmotion(card.id);return <button type="button" key={card.key} aria-label={shown?e.name:'蓋住的卡片'} onClick={()=>flip(card)} className={`tap card aspect-square p-2 flex items-center justify-center ${matched.includes(card.id)?'opacity-40':''}`} style={{backgroundColor:shown?e.tint:'#BFD4E8'}}>{shown?(card.type==='face'?<EmotionFace emotion={e} size={130} className="max-w-full h-auto"/>:<span className="text-3xl font-bold" style={{color:e.color}}>{e.name}</span>):<span className="text-5xl">？</span>}</button>})}</div></Screen>
}

export function CauseGame({ go }) {
  const app=useApp(), {settings}=app, pool=useMemo(()=>activeEmotions(settings),[settings]), bank=useMemo(()=>scenariosFor(pool.map(e=>e.id)),[pool]), len=settings.roundLength
  const round=useMemo(()=>shuffle(bank).slice(0,len),[bank,len]), [qi,setQi]=useState(0), [wrong,setWrong]=useState([]), [earned,setEarned]=useState(0), q=round[qi], emotion=getEmotion(q?.emotionId)
  const choices=useMemo(()=>q?shuffle([q,...shuffle(bank.filter(x=>x.emotionId!==q.emotionId)).slice(0,Math.max(1,settings.choices-1))]):[],[q,bank,settings.choices,qi]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(()=>{if(q){const t=setTimeout(()=>speak(`他覺得${emotion.name}。哪一件事可能讓他有這種感覺？`,settings),250);return()=>clearTimeout(t)}},[qi]) // eslint-disable-line react-hooks/exhaustive-deps
  if(!q)return <Screen title="他為什麼這樣？" onBack={()=>go('home')}><RoundEnd earned={earned} total={round.length} onAgain={()=>{setQi(0);setWrong([]);setEarned(0)}} onHome={()=>go('home')} onRewards={()=>go('rewards')}/></Screen>
  const pick=c=>{if(c.id===q.id){const first=!wrong.length;if(first){app.addStars(1);setEarned(n=>n+1)}app.recordAttempt({mode:'cause',emotionId:q.emotionId,correct:first,tries:wrong.length+1});sfx.correct(settings);speak(q.because,settings);setTimeout(()=>{setQi(n=>n+1);setWrong([])},1300)}else{setWrong(w=>[...w,c.id]);sfx.retry(settings)}}
  return <Screen title="他為什麼這樣？" onBack={()=>go('home')}><ProgressDots total={round.length} done={qi}/><div className="flex-1 flex flex-col items-center justify-center gap-4"><EmotionFace emotion={emotion} size={150}/><h2 className="text-3xl font-bold">他覺得{emotion.name}，可能發生了什麼事？</h2><div className="grid md:grid-cols-3 gap-3 max-w-5xl w-full">{choices.map(c=><Choice key={c.id} wrong={wrong.includes(c.id)} disabled={wrong.includes(c.id)} onClick={()=>pick(c)}><ScenarioIcon name={c.icon} size={64} className="mx-auto mb-2"/><span className="font-normal">{c.text}</span></Choice>)}</div></div></Screen>
}
