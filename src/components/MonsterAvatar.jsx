export default function MonsterAvatar({ monster, size = 120, intensity = 2, selected = false }) {
  if (!monster) return null
  const scale = [0.72, 1, 1.25][intensity - 1] || 1
  const radius = { round: '50%', star: '38% 62% 42% 58%', horn: '42% 42% 48% 48%', drop: '55% 55% 65% 35%', fuzzy: '46% 54% 45% 55%', spiral: '50% 42% 55% 45%', jelly: '50% 50% 28% 28%' }[monster.shape]
  return <div className="relative flex items-center justify-center transition-transform duration-300" style={{ width:size, height:size, transform:`scale(${scale})` }} aria-label={`${monster.name}，${monster.emotion}`}>
    {monster.id==='spark'&&<span className="absolute -top-4 text-3xl animate-pulse">✦ ✧</span>}
    {monster.id==='puff'&&<span className="absolute -top-5 text-3xl animate-pulse">♨</span>}
    {monster.id==='drop'&&<span className="absolute -top-5 text-3xl">☁</span>}
    <div className={`relative w-[82%] h-[78%] border-4 border-ink/70 shadow-sm flex flex-col items-center justify-center ${monster.id==='bounce'?'animate-floatY':''} ${monster.id==='tremble'?'animate-sway':''}`} style={{backgroundColor:monster.color,borderRadius:radius,boxShadow:selected?'0 0 0 8px #fff, 0 0 0 13px '+monster.color:undefined}}>
      {monster.id==='puff'&&<><span className="absolute -top-4 left-4 text-3xl">▲</span><span className="absolute -top-4 right-4 text-3xl">▲</span></>}
      <div className="flex gap-4"><span className="w-3 h-4 rounded-full bg-ink"/><span className="w-3 h-4 rounded-full bg-ink"/></div>
      <span className="text-2xl font-bold leading-none mt-2">{monster.mark}</span>
      {monster.id==='tremble'&&<span className="absolute inset-x-3 bottom-1 border-4 border-ink/50 rounded-full h-8"/>}
      {monster.id==='float'&&<span className="absolute -bottom-5 text-3xl">〰〰〰</span>}
    </div>
  </div>
}
