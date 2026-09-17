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
  turtle: ({ c, s }) => (
    <>
      <path d="M12 42a20 15 0 0 1 40 0Z" fill={s} stroke={c} strokeWidth="3.4" strokeLinejoin="round" />
      <circle cx="9" cy="40" r="6" fill={s} stroke={c} strokeWidth="3" />
      <circle cx="7" cy="38" r="1.2" fill={c} />
      <path d="M18 48l-3 6M28 50l-2 6M40 50l2 6M50 48l3 6" stroke={c} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M54 44l6 2-6 3Z" fill={s} stroke={c} strokeWidth="2.4" strokeLinejoin="round" />
    </>
  ),
  bubble: ({ c, s }) => (
    <>
      <circle cx="27" cy="35" r="17" fill={s} stroke={c} strokeWidth="3.2" />
      <circle cx="46" cy="19" r="8" fill={s} stroke={c} strokeWidth="2.8" />
      <circle cx="21" cy="27" r="3.5" fill="#fff" opacity="0.75" />
      <circle cx="43" cy="16" r="1.8" fill="#fff" opacity="0.75" />
    </>
  ),
  count: ({ c, s }) => (
    <>
      <rect x="8" y="16" width="48" height="32" rx="8" fill={s} stroke={c} strokeWidth="3.4" />
      <text x="32" y="39" fontSize="21" fontWeight="700" textAnchor="middle" fill={c} fontFamily="sans-serif">10</text>
    </>
  ),
  squeeze: ({ c, s }) => (
    <>
      <circle cx="32" cy="32" r="15" fill={s} stroke={c} strokeWidth="3.4" />
      <path d="M32 2v10M26 6l6 6 6-6" fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 62v-10M26 58l6-6 6 6" fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 32h10M6 26l6 6-6 6" fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M62 32h-10M58 26l-6 6 6 6" fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  clap: ({ c, s }) => (
    <>
      <path d="M14 40c-2-10 4-20 14-22 8-2 15 3 17 11" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M50 40c2-10-4-20-14-22-8-2-15 3-17 11" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M18 42q14 10 28 0" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />
      <path d="M30 8l2 6M34 8l-2 6M11 18l4 4M53 18l-4 4" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  jump: ({ c }) => (
    <>
      <circle cx="32" cy="14" r="6" fill="none" stroke={c} strokeWidth="3" />
      <path d="M32 20v14M32 34l-10 14M32 34l10 14M32 26l-12-4M32 26l12-4" stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  tear: ({ c, s }) => (
    <path d="M32 12c9 12 14 20 14 27a14 14 0 0 1-28 0c0-7 5-15 14-27Z" fill={s} stroke={c} strokeWidth="3.4" strokeLinejoin="round" />
  ),
  droop: ({ c, s }) => (
    <>
      <circle cx="32" cy="20" r="13" fill={s} stroke={c} strokeWidth="3.4" />
      <path d="M23 19q9 7 18 0" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M32 38v8M25 44l7 7 7-7" stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  stop: ({ c, s }) => (
    <>
      <polygon points="20,8 44,8 56,20 56,44 44,56 20,56 8,44 8,20" fill={s} stroke={c} strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M18 32h28" stroke={c} strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  fist: ({ c, s }) => (
    <>
      <rect x="16" y="24" width="32" height="26" rx="10" fill={s} stroke={c} strokeWidth="3.4" />
      <path d="M24 24v-6M32 24v-8M40 24v-6" stroke={c} strokeWidth="3" strokeLinecap="round" />
      <rect x="10" y="34" width="11" height="15" rx="5.5" fill={s} stroke={c} strokeWidth="3" />
    </>
  ),
  megaphone: ({ c, s }) => (
    <>
      <path d="M10 30v8l10 3V27Z" fill={s} stroke={c} strokeWidth="3" strokeLinejoin="round" />
      <path d="M20 24v20l26 10V14Z" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M14 41l3 10" stroke={c} strokeWidth="3" strokeLinecap="round" />
      <path d="M50 22q6 6 0 12" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  stomp: ({ c, s }) => (
    <>
      <path d="M10 46c0-10 6-18 14-20l4-8 14 4v14l10 4v6a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4Z" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M14 52l-4 6M32 52v6M50 52l4 6" stroke={c} strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  push: ({ c, s }) => (
    <>
      <rect x="30" y="18" width="26" height="26" rx="3" fill={s} stroke={c} strokeWidth="3.2" />
      <path d="M6 31h18M18 23l8 8-8 8" fill="none" stroke={c} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  shiver: ({ c }) => (
    <>
      <path d="M16 12q6 8 0 16t0 16t0 16" fill="none" stroke={c} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M32 12q6 8 0 16t0 16t0 16" fill="none" stroke={c} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M48 12q6 8 0 16t0 16t0 16" fill="none" stroke={c} strokeWidth="3.4" strokeLinecap="round" />
    </>
  ),
  door: ({ c, s }) => (
    <>
      <rect x="16" y="8" width="32" height="48" rx="2" fill={s} stroke={c} strokeWidth="3.4" />
      <circle cx="38" cy="32" r="2.6" fill={c} />
    </>
  ),
  heartbeat: ({ c, s }) => (
    <>
      <path d="M32 50C14 38 8 26 14 18c5-7 15-6 18 2 3-8 13-9 18-2 6 8 0 20-18 32Z" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M12 30h8l4-8 6 14 4-9 3 3h9" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  gasp: ({ c, s }) => (
    <ellipse cx="32" cy="32" rx="14" ry="18" fill={s} stroke={c} strokeWidth="3.6" />
  ),
  pause: ({ c }) => (
    <>
      <rect x="16" y="12" width="12" height="40" rx="4" fill={c} />
      <rect x="36" y="12" width="12" height="40" rx="4" fill={c} />
    </>
  ),
  chair: ({ c, s }) => (
    <>
      <path d="M18 10v26M18 10h20a4 4 0 0 1 4 4v10" fill="none" stroke={c} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="16" y="34" width="30" height="8" rx="2" fill={s} stroke={c} strokeWidth="3.2" />
      <path d="M18 42v12M44 42v12" stroke={c} strokeWidth="3.4" strokeLinecap="round" />
    </>
  ),
  sofa: ({ c, s }) => (
    <>
      <rect x="10" y="26" width="44" height="18" rx="6" fill={s} stroke={c} strokeWidth="3.2" />
      <path d="M14 26v-8a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v8" fill="none" stroke={c} strokeWidth="3" strokeLinejoin="round" />
      <path d="M12 44v6M52 44v6" stroke={c} strokeWidth="3.4" strokeLinecap="round" />
    </>
  ),
  blossom: ({ c, s }) => (
    <>
      <circle cx="32" cy="18" r="8" fill={s} stroke={c} strokeWidth="2.8" />
      <circle cx="46" cy="28" r="8" fill={s} stroke={c} strokeWidth="2.8" />
      <circle cx="41" cy="44" r="8" fill={s} stroke={c} strokeWidth="2.8" />
      <circle cx="23" cy="44" r="8" fill={s} stroke={c} strokeWidth="2.8" />
      <circle cx="18" cy="28" r="8" fill={s} stroke={c} strokeWidth="2.8" />
      <circle cx="32" cy="32" r="6" fill={c} />
    </>
  ),
  quiet: ({ c, s }) => (
    <>
      <path d="M15 25h8l11-9v32l-11-9h-8Z" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M40 27q3 5 0 10" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  shirt: ({ c, s }) => (
    <path d="M22 12 12 20l4 8 6-3v27h20V25l6 3 4-8-10-8-6 4h-8Z" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
  ),
  zzz: ({ c }) => (
    <>
      <text x="8" y="26" fontSize="20" fontWeight="700" fill={c} fontFamily="sans-serif">Z</text>
      <text x="26" y="40" fontSize="16" fontWeight="700" fill={c} fontFamily="sans-serif">z</text>
      <text x="38" y="53" fontSize="13" fontWeight="700" fill={c} fontFamily="sans-serif">z</text>
    </>
  ),
  moon: ({ c, s }) => (
    <path d="M40 10a22 22 0 1 0 0 44 18 18 0 0 1 0-44Z" fill={s} stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
  ),
  handshake: ({ c, s }) => (
    <>
      <path
        d="M20 58V28a4 4 0 0 1 8 0v-6a4 4 0 0 1 8 0v-4a4 4 0 0 1 8 0v4a4 4 0 0 1 8 0v20c0 11-6 16-6 16Z"
        fill={s} stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M20 38l-7 5c-2 1.5-2 4.5 0 6.5l11 9h22" fill={s} stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
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
