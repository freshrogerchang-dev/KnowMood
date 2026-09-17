// 手繪風格的卡通圖示庫 —— 取代 emoji。
//
// 為什麼要換掉 emoji：emoji 在 iOS / Android / Windows / Linux 長得完全不一樣
// （顏色、粗細、甚至造型），會打斷這個 App 已經建立起來的視覺系統
// （跟 EmotionFace 一樣的圓潤線條、低飽和色票、paper texture）。
//
// 畫法跟 EmotionFace 一致：viewBox 0 0 64 64、圓端線條（strokeLinecap="round"）、
// 用 `color` 決定線條顏色（預設用文字墨色，呼叫端可以傳模式卡自己的 edge 色），
// 用 `tint` 決定淺色填底（預設沿用呼叫端卡片本身的底色，圖示只需要負責線條）。
//
// 新增圖示：在 PATHS 裡加一個 `<name>: (props) => (<>...</>)` 就好，
// 呼叫端一律用 <Icon name="xxx" />，不用另外 import 每一個圖示。

const INK = '#3F3A34'

const P = {
  // ---------- 主畫面十一個模式 ----------
  gallery: ({ c, s }) => (
    <>
      <rect x="14" y="16" width="30" height="8" rx="2.5" fill={s} stroke={c} strokeWidth="3.2" transform="rotate(-8 29 20)" />
      <rect x="16" y="24" width="34" height="9" rx="2.5" fill={s} stroke={c} strokeWidth="3.2" transform="rotate(-3 33 28.5)" />
      <rect x="15" y="34" width="36" height="14" rx="3" fill={s} stroke={c} strokeWidth="3.2" />
      <path d="M33 34v14" stroke={c} strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  where: ({ c, s }) => (
    <>
      <circle cx="32" cy="17" r="8" fill={s} stroke={c} strokeWidth="3.4" />
      <path d="M32 27c-9 0-14 6-14 15v10h28V42c0-9-5-15-14-15Z" fill={s} stroke={c} strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M25 40q7 6 14 0" stroke={c} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <circle cx="32" cy="34" r="2.6" fill={c} />
    </>
  ),
  match: ({ c, s }) => (
    <>
      <circle cx="32" cy="32" r="18" fill={s} stroke={c} strokeWidth="3.4" />
      <circle cx="32" cy="32" r="10.5" fill="none" stroke={c} strokeWidth="3" />
      <circle cx="32" cy="32" r="3.6" fill={c} />
    </>
  ),
  scenario: ({ c, s }) => (
    <>
      <polygon points="18,44 27,44 27,54 18,48" fill={s} stroke={c} strokeWidth="3" strokeLinejoin="round" />
      <rect x="12" y="14" width="40" height="30" rx="7" fill={s} stroke={c} strokeWidth="3.4" />
      <path d="M27 24a5 5 0 0 1 10-1.6c.8 2.4-.8 3.6-2.4 5-1.4 1.2-2.4 2.4-2.4 4.4" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="37.5" r="2.2" fill={c} />
    </>
  ),
  detective: ({ c, s }) => (
    <>
      <circle cx="27" cy="27" r="13" fill={s} stroke={c} strokeWidth="3.6" />
      <path d="M37 37l11 11" stroke={c} strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  voice: ({ c, s }) => (
    <>
      <path
        d="M36 14c-11 0-19 9-19 20 0 8 4 13 9 17 2 1.5 3 3 3 5.5a3 3 0 0 0 6 0c0-4-2-6.5-5-9-4-3.5-7-7-7-13.5 0-8 6-13.5 13-13.5s12 5 12 12c0 4-1.5 6-4 8" 
        fill={s} stroke={c} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M31 27c-3 1.5-4.5 4-4.5 7s1.5 5 4 6.5" fill="none" stroke={c} strokeWidth="2.8" strokeLinecap="round" />
    </>
  ),
  family: ({ c, s }) => (
    <>
      <circle cx="23" cy="20" r="6.5" fill={s} stroke={c} strokeWidth="3" />
      <path d="M23 29c-6.5 0-10 4-10 10.5V44h20v-4.5C33 33 29.5 29 23 29Z" fill={s} stroke={c} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="41" cy="24" r="5" fill={s} stroke={c} strokeWidth="2.8" />
      <path d="M41 31.5c-5 0-7.8 3-7.8 8V44h15.6v-4.5c0-5-2.8-8-7.8-8Z" fill={s} stroke={c} strokeWidth="2.8" strokeLinejoin="round" />
    </>
  ),
  mimic: ({ c, s }) => (
    <>
      <circle cx="32" cy="24" r="14" fill={s} stroke={c} strokeWidth="3.6" />
      <path d="M32 38v14" stroke={c} strokeWidth="4.2" strokeLinecap="round" />
      <path d="M24 52h16" stroke={c} strokeWidth="4.2" strokeLinecap="round" />
      <path d="M25 18q7-6 14 0" stroke={c} strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.55" />
    </>
  ),
  journal: ({ c, s }) => (
    <>
      <path d="M18 16h22a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H18Z" fill={s} stroke={c} strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M18 16v36" stroke={c} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M38 14v10l-4-3-4 3V14Z" fill={c} />
    </>
  ),
  calm: ({ c, s }) => (
    <>
      <path d="M32 50c-14-4-16-16-12-28 10 0 20 6 22 18 1 6-2 8-2 8" fill={s} stroke={c} strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M20 22c8 6 12 16 12 28" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  rewards: ({ c, s }) => (
    <>
      <rect x="16" y="28" width="32" height="22" rx="3" fill={s} stroke={c} strokeWidth="3.4" />
      <path d="M16 36h32" stroke={c} strokeWidth="3" />
      <path d="M32 28v22" stroke={c} strokeWidth="3" />
      <path d="M32 28c-3-9-13-9-13-2 0 4 6 2 13 2Z" fill={s} stroke={c} strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M32 28c3-9 13-9 13-2 0 4-6 2-13 2Z" fill={s} stroke={c} strokeWidth="2.8" strokeLinejoin="round" />
    </>
  ),

  // ---------- 常用 UI 圖示 ----------
  home: ({ c, s }) => (
    <>
      <path d="M13 30 32 15l19 15" fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 27v20a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V27" fill={s} stroke={c} strokeWidth="3.6" strokeLinejoin="round" />
      <rect x="27" y="36" width="10" height="13" rx="1.5" fill={c} opacity="0.85" />
    </>
  ),
  speaker: ({ c, s }) => (
    <>
      <path d="M15 25h8l11-9v32l-11-9h-8Z" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M40 24q5 8 0 16" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />
      <path d="M46 18q9 14 0 28" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  star: ({ c, s }) => (
    <path
      d="M32 13l6.2 12.6 13.9 2-10 9.8 2.4 13.9L32 44.7 19.5 51.3l2.4-13.9-10-9.8 13.9-2Z"
      fill={s === 'none' ? c : s} stroke={c} strokeWidth="3" strokeLinejoin="round"
    />
  ),
  trash: ({ c, s }) => (
    <>
      <path d="M16 22h32" stroke={c} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M26 22v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" fill="none" stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M20 22l2.5 26a3 3 0 0 0 3 2.8h13a3 3 0 0 0 3-2.8L44 22Z" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M27 29v14M37 29v14" stroke={c} strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  plus: ({ c }) => <path d="M32 16v32M16 32h32" stroke={c} strokeWidth="5" strokeLinecap="round" />,
  camera: ({ c, s }) => (
    <>
      <path d="M22 20l3-4h14l3 4h6a3 3 0 0 1 3 3v20a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3V23a3 3 0 0 1 3-3Z" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
      <circle cx="32" cy="34" r="9" fill="none" stroke={c} strokeWidth="3.2" />
      <circle cx="32" cy="34" r="3.6" fill={c} />
    </>
  ),
  check: ({ c }) => <path d="M15 33l11 11 23-25" fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />,
  again: ({ c }) => (
    <>
      <path d="M46 22A17 17 0 1 0 49 34" fill="none" stroke={c} strokeWidth="4.2" strokeLinecap="round" />
      <path d="M40 12l9 4-3 10Z" fill={c} strokeLinejoin="round" />
    </>
  ),
  thumbsUp: ({ c, s }) => (
    <>
      <path d="M18 28h6v22h-6Z" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
      <path
        d="M27 28l7-14a4 4 0 0 1 7 3l-2 9h11a4 4 0 0 1 4 5l-4 15a5 5 0 0 1-5 4H27Z"
        fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round"
      />
    </>
  ),
  warning: ({ c, s }) => (
    <>
      <path d="M32 14 55 50H9Z" fill={s} stroke={c} strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M32 28v10" stroke={c} strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="32" cy="43" r="2.4" fill={c} />
    </>
  ),
  idea: ({ c, s }) => (
    <>
      <path d="M32 12c-8 0-14 6-14 13 0 5 2.5 8 5.5 11 1.5 1.5 2.5 3 2.5 5h12c0-2 1-3.5 2.5-5 3-3 5.5-6 5.5-11 0-7-6-13-14-13Z" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M26 47h12M28 51h8" stroke={c} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  lock: ({ c, s }) => (
    <>
      <rect x="16" y="28" width="32" height="24" rx="4" fill={s} stroke={c} strokeWidth="3.4" />
      <path d="M22 28v-6a10 10 0 0 1 20 0v6" fill="none" stroke={c} strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="32" cy="38" r="3.6" fill={c} />
      <path d="M32 41v6" stroke={c} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  close: ({ c }) => <path d="M18 18l28 28M46 18l-28 28" stroke={c} strokeWidth="5" strokeLinecap="round" />,
  back: ({ c }) => <path d="M40 14 20 32l20 18" fill="none" stroke={c} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />,
  brow: ({ c }) => (
    <>
      <path d="M8 38q24-20 48 0" fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  mirror: ({ c, s }) => (
    <>
      <ellipse cx="32" cy="26" rx="15" ry="18" fill={s} stroke={c} strokeWidth="3.4" />
      <path d="M32 44v14M24 58h16" stroke={c} strokeWidth="3.6" strokeLinecap="round" />
    </>
  ),
  ear: ({ c, s }) => (
    <>
      <path d="M30 12c-9 0-15 8-15 17 0 11 8 15 8 23a5 5 0 0 0 10 0" fill={s} stroke={c} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27 24a6 6 0 0 1 6 6c0 3-2 4-4 6" fill="none" stroke={c} strokeWidth="2.8" strokeLinecap="round" />
    </>
  ),
  mouth: ({ c, s }) => (
    <>
      <path d="M12 30q20-8 40 0q-20 18-40 0Z" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M18 30q14-5 28 0" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  eye: ({ c, s }) => (
    <>
      <path d="M8 32q24-20 48 0q-24 20-48 0Z" fill={s} stroke={c} strokeWidth="3.4" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="8" fill={c} />
    </>
  ),
  cloud: ({ c, s }) => (
    <path
      d="M20 44a11 11 0 0 1-2-21.8 14 14 0 0 1 27-4A11.5 11.5 0 0 1 46 44Z"
      fill={s} stroke={c} strokeWidth="3.4" strokeLinejoin="round"
    />
  ),
  download: ({ c }) => (
    <>
      <path d="M32 12v26M22 30l10 10 10-10" fill="none" stroke={c} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 46h36" stroke={c} strokeWidth="4.2" strokeLinecap="round" />
    </>
  ),
  speech: ({ c, s }) => (
    <>
      <path d="M12 16h40a3 3 0 0 1 3 3v20a3 3 0 0 1-3 3H30l-9 8v-8h-9a3 3 0 0 1-3-3V19a3 3 0 0 1 3-3Z" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M20 27h24M20 34h16" stroke={c} strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  handshake: ({ c, s }) => (
    <>
      <path d="M6 30l10-8 8 4 8-4 26 10-6 12-6-3" fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 26l10 6-3 6a4 4 0 0 1-6-4" fill={s} stroke={c} strokeWidth="3" strokeLinejoin="round" />
      <path d="M6 30l6 14 8 4" fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  mute: ({ c, s }) => (
    <>
      <path d="M15 25h8l11-9v32l-11-9h-8Z" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M40 24l12 16M52 24l-12 16" stroke={c} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  demo: ({ c, s }) => (
    <>
      <rect x="10" y="24" width="44" height="28" rx="3" fill={s} stroke={c} strokeWidth="3.2" />
      <path d="M10 24l6-10h8l-6 10M28 24l6-10h8l-6 10M46 24l4-7" fill={s} stroke={c} strokeWidth="3" strokeLinejoin="round" />
      <polygon points="27,32 27,44 39,38" fill={c} />
    </>
  ),
  school: ({ c, s }) => (
    <>
      <path d="M32 10 8 24h48Z" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
      <rect x="14" y="24" width="36" height="28" fill={s} stroke={c} strokeWidth="3.2" />
      <rect x="27" y="36" width="10" height="16" fill={c} opacity="0.85" />
      <path d="M32 10V3" stroke={c} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M32 3h10l-10 7Z" fill={c} />
    </>
  ),
  toy: ({ c, s }) => (
    <>
      <circle cx="21" cy="16" r="6" fill={s} stroke={c} strokeWidth="3" />
      <circle cx="43" cy="16" r="6" fill={s} stroke={c} strokeWidth="3" />
      <circle cx="32" cy="32" r="18" fill={s} stroke={c} strokeWidth="3.4" />
      <circle cx="25" cy="29" r="2.6" fill={c} />
      <circle cx="39" cy="29" r="2.6" fill={c} />
      <path d="M26 38q6 5 12 0" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  friends: ({ c, s }) => (
    <>
      <circle cx="21" cy="20" r="8" fill={s} stroke={c} strokeWidth="3.2" />
      <path d="M21 30c-7.5 0-12 5-12 12v6h24v-6c0-7-4.5-12-12-12Z" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
      <circle cx="43" cy="20" r="8" fill={s} stroke={c} strokeWidth="3.2" />
      <path d="M43 30c-7.5 0-12 5-12 12v6h24v-6c0-7-4.5-12-12-12Z" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
    </>
  ),
  meal: ({ c, s }) => (
    <>
      <path d="M10 30h44c0 12-9 20-22 20S10 42 10 30Z" fill={s} stroke={c} strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M10 30a22 8 0 0 1 44 0" fill="none" stroke={c} strokeWidth="3" />
      <path d="M46 20l6-8M50 20l4-9" stroke={c} strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  playground: ({ c, s }) => (
    <>
      <path d="M16 52V18M24 52V18" stroke={c} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M16 26h8M16 34h8M16 42h8" stroke={c} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M24 18q26 3 28 30" fill={s} stroke={c} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M52 48h-9" stroke={c} strokeWidth="3.4" strokeLinecap="round" />
    </>
  ),
  tv: ({ c, s }) => (
    <>
      <rect x="8" y="14" width="48" height="30" rx="3" fill={s} stroke={c} strokeWidth="3.2" />
      <path d="M24 50h16M32 44v6" stroke={c} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  bed: ({ c, s }) => (
    <>
      <path d="M8 50v-8a4 4 0 0 1 4-4h40a4 4 0 0 1 4 4v8" fill="none" stroke={c} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="8" y="22" width="9" height="16" rx="2.5" fill={c} opacity="0.5" />
      <rect x="19" y="28" width="33" height="10" rx="3" fill={s} stroke={c} strokeWidth="3" />
      <path d="M8 50v4M56 50v4" stroke={c} strokeWidth="3.4" strokeLinecap="round" />
    </>
  ),
  car: ({ c, s }) => (
    <>
      <path d="M9 38 14 24a4 4 0 0 1 4-3h20a4 4 0 0 1 4 3l5 14" fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="6" y="38" width="52" height="10" rx="3" fill={s} stroke={c} strokeWidth="3.2" />
      <circle cx="18" cy="50" r="5" fill={c} />
      <circle cx="46" cy="50" r="5" fill={c} />
    </>
  ),
  celebrate: ({ c, s }) => (
    <>
      <path d="M14 50 40 16l10 10-34 26Z" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M44 12l3 5M52 20l5 3M46 24l4 2" stroke={c} strokeWidth="3" strokeLinecap="round" />
      <circle cx="20" cy="40" r="2" fill={c} />
      <circle cx="26" cy="46" r="2" fill={c} />
    </>
  ),
  question: ({ c, s }) => (
    <>
      <circle cx="32" cy="32" r="19" fill={s} stroke={c} strokeWidth="3.4" />
      <path d="M25 26a7 7 0 0 1 13.5-2.4c1 3-1 4.6-3 6.4-1.8 1.6-3 3-3 5.5" fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="32" cy="43" r="2.4" fill={c} />
    </>
  ),
}

/**
 * 手繪卡通圖示。
 * @param {{name:string, size?:number, color?:string, tint?:string, className?:string}} props
 */
export default function Icon({ name, size = 32, color = INK, tint = 'none', className = '' }) {
  const draw = P[name]
  if (!draw) return null
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} role="img" aria-hidden="true">
      {draw({ c: color, s: tint })}
    </svg>
  )
}

export const ICON_NAMES = Object.keys(P)
