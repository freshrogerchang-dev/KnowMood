export const EVENT_CHIPS = [
  { icon: 'school', text: '在學校的時候' },
  { icon: 'toy', text: '在玩玩具的時候' },
  { icon: 'friends', text: '跟朋友一起玩' },
  { icon: 'meal', text: '吃飯的時候' },
  { icon: 'playground', text: '去公園玩' },
  { icon: 'tv', text: '看電視的時候' },
  { icon: 'bed', text: '要睡覺的時候' },
  { icon: 'car', text: '出門坐車的時候' },
]

export function journalSummary(event, feeling, intensity, coping) {
  const context = event.trim() || '今天'
  return `記好了！${context}，你覺得${feeling}，${intensity}。${coping}`
}
