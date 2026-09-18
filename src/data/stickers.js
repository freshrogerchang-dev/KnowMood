// 貼紙簿：集星星換貼紙。用物件圖示（不用人臉），避免和情緒臉譜混淆。
export const STICKERS = [
  { id: 'star', icon: 'star', name: '第一顆星星', cost: 3 },
  { id: 'balloon', icon: 'balloon', name: '氣球', cost: 6 },
  { id: 'cookie', icon: 'cookie', name: '餅乾', cost: 10 },
  { id: 'car', icon: 'car', name: '小汽車', cost: 15 },
  { id: 'dino', icon: 'dino', name: '恐龍', cost: 21 },
  { id: 'rocket', icon: 'rocket', name: '火箭', cost: 28 },
  { id: 'cake', icon: 'cake', name: '蛋糕', cost: 36 },
  { id: 'rainbow', icon: 'rainbow', name: '彩虹', cost: 45 },
  { id: 'crown', icon: 'crown', name: '皇冠', cost: 55 },
  { id: 'trophy', icon: 'trophy', name: '獎盃', cost: 70 },
]

export const nextSticker = (stars, owned = []) =>
  STICKERS.find((s) => !owned.includes(s.id) && s.cost > stars) ||
  STICKERS.find((s) => !owned.includes(s.id)) ||
  null

export const unlockedStickers = (stars) => STICKERS.filter((s) => stars >= s.cost)
