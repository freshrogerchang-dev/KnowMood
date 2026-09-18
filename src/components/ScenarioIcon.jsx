import Icon from './Icon'

import cake from '../assets/scenario-icons/cake.png'
import cookie from '../assets/scenario-icons/cookie.png'
import blocks from '../assets/scenario-icons/blocks.png'
import dog from '../assets/scenario-icons/dog.png'
import icecream from '../assets/scenario-icons/icecream.png'
import backpack from '../assets/scenario-icons/backpack.png'
import crayon from '../assets/scenario-icons/crayon.png'
import train from '../assets/scenario-icons/train.png'
import hourglass from '../assets/scenario-icons/hourglass.png'
import puzzle from '../assets/scenario-icons/puzzle.png'
import thunderstorm from '../assets/scenario-icons/thunderstorm.png'
import hospital from '../assets/scenario-icons/hospital.png'
import balloon from '../assets/scenario-icons/balloon.png'
import microphone from '../assets/scenario-icons/microphone.png'
import running from '../assets/scenario-icons/running.png'
import bicycle from '../assets/scenario-icons/bicycle.png'
import frame from '../assets/scenario-icons/frame.png'
import sprout from '../assets/scenario-icons/sprout.png'
import palette from '../assets/scenario-icons/palette.png'

// 情境卡／故事卡的物件圖示：Canva 生成的插畫（放不進 Icon.jsx 那套手繪線稿風格的
// 具體場景物件），跟已經有手繪 SVG 版本的物件（門、床、書⋯）共用同一個呼叫介面，
// 呼叫端不用管一張圖到底是 <img> 還是 <Icon>。
const IMAGES = {
  cake, cookie, blocks, dog, icecream, backpack, crayon, train, hourglass,
  puzzle, thunderstorm, hospital, balloon, microphone, running, bicycle,
  frame, sprout, palette,
}

/**
 * @param {{name:string, size?:number, className?:string}} props
 */
export default function ScenarioIcon({ name, size = 64, className = '' }) {
  const src = IMAGES[name]
  if (src) {
    return <img src={src} width={size} height={size} className={className} draggable={false} alt="" />
  }
  return <Icon name={name} size={size} className={className} />
}
