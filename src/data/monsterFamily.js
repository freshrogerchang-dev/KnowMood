export const MONSTER_FAMILY = [
  { id: 'bounce', name: '蹦蹦', emotion: '開心', emotionId: 'happy', shape: 'round', mark: '●', action: '彈跳', color: '#F3C14F' },
  { id: 'spark', name: '閃閃', emotion: '興奮', emotionId: 'surprised', shape: 'star', mark: '★', action: '快速搖擺', color: '#F0A84B' },
  { id: 'puff', name: '噗噗', emotion: '生氣', emotionId: 'angry', shape: 'horn', mark: '♨', action: '冒煙', color: '#E08A6E' },
  { id: 'drop', name: '滴滴', emotion: '難過', emotionId: 'sad', shape: 'drop', mark: '☂', action: '帶著雨雲', color: '#7FA9D4' },
  { id: 'tremble', name: '抖抖', emotion: '害怕', emotionId: 'scared', shape: 'fuzzy', mark: '⌒', action: '縮進殼裡', color: '#A99BD4' },
  { id: 'swirl', name: '轉轉', emotion: '擔心', emotionId: 'scared', shape: 'spiral', mark: '◎', action: '慢慢轉圈', color: '#B393CF' },
  { id: 'float', name: '呼呼', emotion: '平靜', emotionId: 'calm', shape: 'jelly', mark: '〰', action: '慢慢漂浮', color: '#6FC2C0' },
]

export const MONSTER_SCENARIOS = [
  ['積木被別人推倒了。', ['puff', 'drop', 'tremble']],
  ['老師說，下課時間要結束了。', ['swirl', 'puff', 'drop']],
  ['明天要去一個沒去過的地方。', ['swirl', 'spark', 'tremble']],
  ['朋友邀請我一起玩。', ['bounce', 'spark', 'swirl']],
  ['我做完一件很難的事情。', ['bounce', 'spark', 'float']],
]

export const NEEDS = ['抱抱', '休息一下', '請大人幫忙', '慢慢呼吸', '安靜的地方', '把話說清楚']
export const REASONS = ['事情和我想的不一樣', '有人碰了我的東西', '聲音太大了', '我不知道接下來會怎樣', '我成功做到了', '我需要休息']

export const MONSTER_SPEECH = [
  '沒有壞怪獸，每一種心情都值得被照顧。', '現在來拜訪我的是誰？可以選一隻，也可以選兩隻。',
  '把怪獸調成小、中或大，看看這個心情有多強。', '這隻怪獸住在身體的哪裡？',
  '用三塊句子積木，說出我的心情、原因和需要。', '這個情境裡，如果是你，哪隻怪獸會來？沒有標準答案。',
  '謝謝你告訴我。每一種心情都值得被照顧。', '現在不能使用麥克風，也可以跟著句子直接說。',
  ...MONSTER_FAMILY.flatMap(m => [`${m.name}代表${m.emotion}，會${m.action}。`, `我覺得${m.emotion}。`]),
]

export const monsterById = id => MONSTER_FAMILY.find(monster => monster.id === id)
