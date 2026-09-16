const TONES = ['ˊ', 'ˇ', 'ˋ']

// 拆出聲調：輕聲「˙」放在注音上方，二三四聲放在右側 —— 台灣課本的標準排法
function parse(z = '') {
  if (z.startsWith('˙')) return { base: z.slice(1), tone: '˙', neutral: true }
  const last = z.slice(-1)
  if (TONES.includes(last)) return { base: z.slice(0, -1), tone: last, neutral: false }
  return { base: z, tone: '', neutral: false }
}

/**
 * 中文字 + 注音。settings.zhuyin 關掉時只顯示國字。
 * 注音用「一個符號一行」的 flex 直排堆出來，不靠 writing-mode，
 * 才不會在某些瀏覽器變成躺著的字。
 * @param {{text:string, zhuyin?:string[], show?:boolean, className?:string}} props
 */
export default function Ruby({ text, zhuyin = [], show = true, className = '' }) {
  const chars = [...String(text)]
  if (!show || !zhuyin.length) return <span className={className}>{text}</span>

  return (
    <span className={`inline-flex items-center gap-[0.12em] ${className}`}>
      {chars.map((ch, i) => {
        const { base, tone, neutral } = parse(zhuyin[i] || '')
        return (
          <span key={i} className="inline-flex items-center">
            <span>{ch}</span>
            {base && (
              <span className="inline-flex items-center ml-[0.06em] text-[0.42em] text-inkSoft font-normal" aria-hidden="true">
                <span className="inline-flex flex-col items-center leading-[0.98]">
                  {neutral && <span className="block">˙</span>}
                  {[...base].map((sym, k) => (
                    <span key={k} className="block">{sym}</span>
                  ))}
                </span>
                {/* 二三四聲標在注音右側；輕聲已經放在上方 */}
                <span className="inline-block w-[0.55em] text-left">{!neutral ? tone : ''}</span>
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}
