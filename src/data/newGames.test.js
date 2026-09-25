import { describe, expect, it } from 'vitest'
import { COPING_ROUNDS, SOCIAL_STORIES, NEW_GAME_SPEECH } from './newGames'
import { EMOTION_BY_ID } from './emotions'

describe('五個延伸遊戲的共用內容', () => {
  it('應對題有三個可辨識選項，且答案與情緒有效', () => {
    expect(COPING_ROUNDS.length).toBeGreaterThanOrEqual(6)
    for (const q of COPING_ROUNDS) {
      expect(EMOTION_BY_ID[q.emotionId]).toBeTruthy()
      expect(q.choices).toHaveLength(3)
      expect(q.choices[q.answer]).toBeTruthy()
    }
  })

  it('社交故事分成短而可預期的四個步驟', () => {
    expect(SOCIAL_STORIES).toHaveLength(4)
    expect(new Set(SOCIAL_STORIES.map(s => s.id)).size).toBe(4)
    for (const story of SOCIAL_STORIES) expect(story.steps).toHaveLength(4)
  })

  it('新遊戲固定旁白都能交給預錄語音產生器', () => {
    expect(NEW_GAME_SPEECH).toContain('只看眼睛和眉毛，猜猜他是什麼心情。')
    expect(new Set(NEW_GAME_SPEECH).size).toBe(NEW_GAME_SPEECH.length)
  })
})
