export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const sample = (arr, n) => shuffle(arr).slice(0, n)

export const randomOf = (arr) => arr[Math.floor(Math.random() * arr.length)]

/**
 * 組出一輪題目：盡量讓每種情緒都輪到，而不是隨機亂跳。
 * 對 ADHD 的孩子，可預期的節奏比較容易維持專注。
 */
export function buildRound(pool, length) {
  const out = []
  while (out.length < length) {
    const batch = shuffle(pool)
    for (const item of batch) {
      if (out.length >= length) break
      // 避免連續兩題同一個答案
      if (out.length && out[out.length - 1] === item && pool.length > 1) continue
      out.push(item)
    }
  }
  return out
}

/** 產生選項：正確答案 + 干擾項，數量由家長設定 */
export function buildChoices(answer, pool, count) {
  const others = pool.filter((e) => e.id !== answer.id)
  return shuffle([answer, ...sample(others, Math.max(0, Math.min(count, others.length + 1) - 1))])
}
