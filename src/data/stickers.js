// 貼紙簿：集星星換貼紙。用物件圖示（不用人臉），避免和情緒臉譜混淆。
export const STICKERS = [
  { id: 'star', icon: '⭐', name: '第一顆星星', cost: 3 },
  { id: 'balloon', icon: '🎈', name: '氣球', cost: 6 },
  { id: 'cookie', icon: '🍪', name: '餅乾', cost: 10 },
  { id: 'car', icon: '🚙', name: '小汽車', cost: 15 },
  { id: 'dino', icon: '🦕', name: '恐龍', cost: 21 },
  { id: 'rocket', icon: '🚀', name: '火箭', cost: 28 },
  { id: 'cake', icon: '🎂', name: '蛋糕', cost: 36 },
  { id: 'rainbow', icon: '🌈', name: '彩虹', cost: 45 },
  { id: 'crown', icon: '👑', name: '皇冠', cost: 55 },
  { id: 'trophy', icon: '🏆', name: '獎盃', cost: 70 },
]

export const nextSticker = (stars, owned = []) =>
  STICKERS.find((s) => !owned.includes(s.id) && s.cost > stars) ||
  STICKERS.find((s) => !owned.includes(s.id)) ||
  null

export const unlockedStickers = (stars) => STICKERS.filter((s) => stars >= s.cost)
