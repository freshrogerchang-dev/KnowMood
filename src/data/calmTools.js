// 冷靜角的工具
//
// Zones of Regulation 那套的核心不是「認出情緒」，是「認出之後從工具箱挑一個來用」。
// 這個 App 原本會跟孩子說「先深呼吸三次」，但沒有真的提供那個東西 ——
// 這幾個工具就是把那句話變成做得到的動作。
//
// steps：一輪的節奏，[提示文字, 持續秒數, 圓圈縮放, 音效]
// 全部用 JS 計時驅動、圓圈大小走 inline style，
// 所以低感官負荷模式（關掉 CSS transition）時會變成一格一格跳，而不是整個壞掉。

export const CALM_TOOLS = [
  {
    id: 'turtle',
    icon: 'turtle',
    name: '烏龜呼吸',
    hint: '像烏龜一樣，慢慢把頭縮進殼裡，再慢慢伸出來。',
    rounds: 4,
    steps: [
      { label: '吸氣…', seconds: 3, scale: 1.35, sound: 'in' },
      { label: '停一下', seconds: 1, scale: 1.35, sound: null },
      { label: '吐氣……', seconds: 4, scale: 0.75, sound: 'out' },
    ],
  },
  {
    id: 'bubble',
    icon: 'bubble',
    name: '吹泡泡',
    hint: '慢慢吹，泡泡才會愈來愈大，不會破掉。',
    rounds: 5,
    steps: [
      { label: '吸一口氣', seconds: 2, scale: 0.7, sound: 'in' },
      { label: '慢慢吹……', seconds: 5, scale: 1.5, sound: 'out' },
      { label: '泡泡飛走了～', seconds: 1, scale: 0.4, sound: null },
    ],
  },
  {
    id: 'count',
    icon: 'count',
    name: '數到十',
    hint: '一個一個慢慢數，數完心裡會比較鬆。',
    rounds: 1,
    counting: true, // 特別處理：數 1 到 10
  },
  {
    id: 'squeeze',
    icon: 'squeeze',
    name: '擠一擠',
    hint: '用力把球擠扁，數到五，再放開。',
    rounds: 3,
    hold: true, // 特別處理：要一直按著
    steps: [
      { label: '用力擠！', seconds: 5, scale: 0.6, sound: null },
      { label: '放～開～', seconds: 3, scale: 1.2, sound: 'out' },
    ],
  },
]

export const getCalmTool = (id) => CALM_TOOLS.find((t) => t.id === id)
