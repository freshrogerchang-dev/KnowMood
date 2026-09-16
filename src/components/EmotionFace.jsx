import { getEmotion } from '../data/emotions'

// 用參數化 SVG 畫臉，不用 emoji：
// 1) 每個平台的 emoji 長相不同，孩子會把「臉」和「某一種圖」綁在一起；
// 2) 自己畫才能控制眉毛 / 眼睛 / 嘴巴三個關鍵線索的對比，方便教學指認。

const INK = '#3F3A34'
const MOUTH = '#5A4A42'

const BROWS = {
  happy: 'M28 44 Q38 38 48 43',
  sad: 'M28 47 Q38 45 48 39',
  angry: 'M28 38 Q38 41 48 47',
  scared: 'M28 40 Q38 33 48 39',
  up: 'M28 37 Q38 30 48 36',
  flat: 'M29 43 Q38 41 47 43',
  droop: 'M28 40 Q38 46 48 45',
}

function Eye({ type }) {
  switch (type) {
    case 'wide':
      return (
        <>
          <ellipse cx="42" cy="59" rx="9" ry="10.5" fill="#FFFFFF" stroke={INK} strokeWidth="2.6" />
          <circle cx="42" cy="60" r="4.6" fill={INK} />
        </>
      )
    case 'narrow':
      return <path d="M33 60 Q42 54 51 60 Q42 65 33 60 Z" fill={INK} />
    case 'arc':
      return <path d="M34 63 Q42 53 50 63" stroke={INK} strokeWidth="4.2" fill="none" strokeLinecap="round" />
    case 'closed':
      return <path d="M34 58 Q42 65 50 58" stroke={INK} strokeWidth="4.2" fill="none" strokeLinecap="round" />
    case 'half':
      return (
        <>
          <path d="M34 59 Q42 63 50 59" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M34 54 Q42 50 50 54" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.45" />
        </>
      )
    case 'down':
      return (
        <>
          <circle cx="42" cy="62" r="4.8" fill={INK} />
          <path d="M33 59 Q42 53 51 59" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )
    default: // open
      return (
        <>
          <circle cx="42" cy="60" r="6.6" fill={INK} />
          <circle cx="44.2" cy="57.6" r="2" fill="#FFFFFF" opacity="0.9" />
        </>
      )
  }
}

function Mouth({ type }) {
  const stroke = { stroke: MOUTH, strokeWidth: 4.4, fill: 'none', strokeLinecap: 'round' }
  switch (type) {
    case 'openSmile':
      return (
        <>
          <path d="M40 76 Q60 102 80 76 Z" fill={MOUTH} />
          <path d="M51 89 Q60 99 69 89 Z" fill="#E59AA0" />
        </>
      )
    case 'smile':
      return <path d="M42 78 Q60 95 78 78" {...stroke} />
    case 'slight':
      return <path d="M48 82 Q60 90 72 82" {...stroke} />
    case 'frown':
      return <path d="M44 91 Q60 76 76 91" {...stroke} />
    case 'wave':
      return <path d="M42 87 Q51 79 60 86 Q69 93 78 85" {...stroke} />
    case 'o':
      return <ellipse cx="60" cy="86" rx="9" ry="12" fill={MOUTH} />
    case 'smallO':
      return <ellipse cx="60" cy="86" rx="6.5" ry="8.5" fill={MOUTH} />
    default: // line
      return <path d="M48 86 Q60 89 72 86" {...stroke} />
  }
}

const ANIM = {
  happy: 'animate-floatY',
  angry: 'animate-sway',
  scared: 'animate-sway',
  surprised: 'animate-popIn',
}

/**
 * @param {{emotion: object|string, size?: number|string, animate?: boolean, className?: string}} props
 */
export default function EmotionFace({ emotion, size = 160, animate = false, className = '' }) {
  const e = typeof emotion === 'string' ? getEmotion(emotion) : emotion
  if (!e) return null
  const f = e.face
  const anim = animate ? ANIM[e.id] || 'animate-floatY' : ''

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`${anim} ${className}`}
      role="img"
      aria-label={e.name}
    >
      {/* 頭 */}
      <circle cx="60" cy="62" r="44" fill={e.tint} stroke={e.color} strokeWidth="3.5" />

      {/* 臉紅（害羞 / 開心） */}
      {f.blush && (
        <>
          <ellipse cx="29" cy="78" rx="9" ry="5.5" fill={e.color} opacity="0.5" />
          <ellipse cx="91" cy="78" rx="9" ry="5.5" fill={e.color} opacity="0.5" />
        </>
      )}

      {/* 眉毛：右邊用鏡像，確保左右完全對稱 */}
      <path d={BROWS[f.brow] || BROWS.flat} stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
      <g transform="translate(120,0) scale(-1,1)">
        <path d={BROWS[f.brow] || BROWS.flat} stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>

      {/* 眼睛 */}
      <Eye type={f.eye} />
      <g transform="translate(120,0) scale(-1,1)">
        <Eye type={f.eye} />
      </g>

      {/* 嘴巴 */}
      <Mouth type={f.mouth} />

      {/* 額外線索 */}
      {f.tear && (
        <path d="M32 70 C28 79 28 84 32 84 C36 84 36 79 32 70 Z" fill="#7FB4E8" className={animate ? 'animate-floatY' : ''} />
      )}
      {f.sweat && <path d="M96 24 C92 33 92 38 96 38 C100 38 100 33 96 24 Z" fill="#8FC7E8" />}
      {f.steam && (
        <>
          <path d="M24 22 q7 -9 14 -1" stroke={e.color} strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.8" />
          <path d="M82 21 q7 -9 14 -1" stroke={e.color} strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.8" />
        </>
      )}
      {f.zzz && (
        <g fill="#7A736A" fontFamily="system-ui" fontWeight="700">
          <text x="93" y="30" fontSize="17">Z</text>
          <text x="106" y="18" fontSize="11">z</text>
        </g>
      )}
    </svg>
  )
}
