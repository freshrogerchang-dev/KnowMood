import { getEmotion } from '../data/emotions'

import happy from '../assets/emotion-monsters/happy.png'
import sad from '../assets/emotion-monsters/sad.png'
import angry from '../assets/emotion-monsters/angry.png'
import scared from '../assets/emotion-monsters/scared.png'
import surprised from '../assets/emotion-monsters/surprised.png'
import calm from '../assets/emotion-monsters/calm.png'
import shy from '../assets/emotion-monsters/shy.png'
import tired from '../assets/emotion-monsters/tired.png'

// 8 種情緒的小怪獸插畫（Canva 生成，手動下載後放進 src/assets/emotion-monsters/）。
// 取代原本參數化畫的 SVG 臉譜 —— 換來的代價：每個情緒是固定顏色的靜態圖，
// 不再能跟著畫面主題動態變色，只保留 animate 用 CSS class 做的縮放/浮動效果。
const MONSTERS = { happy, sad, angry, scared, surprised, calm, shy, tired }

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
  const src = MONSTERS[e.id]
  if (!src) return null
  const anim = animate ? ANIM[e.id] || 'animate-floatY' : ''

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={e.name}
      className={`${anim} ${className}`}
      draggable={false}
    />
  )
}
