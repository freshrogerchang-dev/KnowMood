import { SCENARIOS } from './scenarios.js'
import { EMOTIONS } from './emotions.js'

const byId = Object.fromEntries(SCENARIOS.map((item) => [item.id, item]))

export const COPING_ROUNDS = [
  { ...byId.a3, choices: ['先深呼吸，再告訴大人有人插隊。', '把前面的人推開。', '大聲罵每一個人。'], answer: 0 },
  { ...byId.s1, choices: ['找大人抱抱，說我很難過。', '把別人的冰淇淋搶走。', '假裝沒事，一直忍住。'], answer: 0 },
  { ...byId.f1, choices: ['牽著大人的手，慢慢呼吸。', '一個人跑到外面。', '摀住別人的耳朵。'], answer: 0 },
  { ...byId.a2, choices: ['先停下來，說我生氣，請他一起修好。', '把他的東西也踢壞。', '用力打他。'], answer: 0 },
  { ...byId.y2, choices: ['請熟悉的大人陪我先打招呼。', '馬上跑回家躲起來。', '對大家大叫。'], answer: 0 },
  { ...byId.t1, choices: ['告訴大人我累了，找地方休息。', '逼自己一直跑。', '生氣地丟東西。'], answer: 0 },
]

export const SOCIAL_STORIES = [
  { id: 'lose', title: '玩遊戲輸了', emotionId: 'sad', steps: [
    ['blocks', '我和朋友一起玩遊戲。'], ['hourglass', '這一局我輸了，我覺得難過。'], ['bubble', '我先慢慢呼吸，讓身體停一下。'], ['thumbsUp', '我可以說：「再玩一次。」也可以休息。'],
  ] },
  { id: 'switch', title: '要換活動了', emotionId: 'angry', steps: [
    ['palette', '我正在做喜歡的活動。'], ['hourglass', '老師說，等一下要換下一個活動。'], ['bubble', '我可以看時間，先做完手上的一步。'], ['thumbsUp', '我把東西收好，再去下一個活動。'],
  ] },
  { id: 'queue', title: '排隊被插隊', emotionId: 'angry', steps: [
    ['hourglass', '我正在排隊等候。'], ['running', '有人走到我的前面，我很生氣。'], ['bubble', '我先讓手和身體停下來。'], ['family', '我可以說：「我在排隊。」或找大人幫忙。'],
  ] },
  { id: 'share', title: '一起玩玩具', emotionId: 'happy', steps: [
    ['toy', '我和朋友都想玩同一個玩具。'], ['hourglass', '我們可以輪流，一個人玩一下。'], ['blocks', '等待時，我先玩別的東西。'], ['celebrate', '輪到我時，我說謝謝，大家都能玩。'],
  ] },
]

export const NEW_GAME_SPEECH = [
  '先看看發生什麼事，再選出他的心情。', '現在可以怎麼做，讓自己安全又舒服一點？',
  '只看眼睛和眉毛，猜猜他是什麼心情。', '翻開兩張卡，找出一樣的心情。',
  '看看這個心情，哪一件事可能讓他有這種感覺？', '故事說完了，你做得很好！',
  '這個做法能照顧自己，也不會傷害別人。', '再想想看，要讓自己和別人都安全。',
  ...EMOTIONS.flatMap((emotion) => [
    `對，他覺得${emotion.name}。`, `對了，這是${emotion.name}的眼睛。`,
    `他覺得${emotion.name}。哪一件事可能讓他有這種感覺？`,
  ]),
  ...COPING_ROUNDS.flatMap((q) => [q.text, `${q.text} 他現在是什麼心情？`, ...q.choices]),
  ...SOCIAL_STORIES.flatMap((story) => [story.title, ...story.steps.map(([, text]) => text)]),
]
