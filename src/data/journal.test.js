import { describe, expect, it } from 'vitest'
import { EVENT_CHIPS, journalSummary } from './journal'
import { EMOTION_WORDS } from './vocabulary'
import { STICKERS } from './stickers'
import { hasBakedSpeech } from '../lib/bakedSpeech'

describe('心情日記旁白', () => {
  it('八個事件按鈕固定且不重複', () => {
    expect(EVENT_CHIPS).toHaveLength(8)
    expect(new Set(EVENT_CHIPS.map((event) => event.text)).size).toBe(8)
  })

  it('完成句不會重複介系詞，事件後有清楚停頓', () => {
    expect(journalSummary('在學校的時候', '開心', '很多', '去擊掌。')).toBe('記好了！在學校的時候，你覺得開心，很多。去擊掌。')
    expect(journalSummary('跟朋友一起玩', '開心', '很多', '去擊掌。')).toBe('記好了！跟朋友一起玩，你覺得開心，很多。去擊掌。')
    expect(journalSummary('', '平靜', '普通', '慢慢呼吸。')).toBe('記好了！今天，你覺得平靜，普通。慢慢呼吸。')
  })

  it('57 個固定缺漏句與首頁問候都有預錄音檔', () => {
    const phrases = [
      ...Object.values(EMOTION_WORDS).flat().map((word) => word.word),
      ...EVENT_CHIPS.map((event) => event.text),
      ...STICKERS.map((sticker) => `恭喜！你得到新貼紙：${sticker.name}！`),
      '哈囉，我們來玩情緒遊戲！',
    ]
    expect(phrases).toHaveLength(58)
    expect(phrases.filter((text) => !hasBakedSpeech(text))).toEqual([])
  })
})
