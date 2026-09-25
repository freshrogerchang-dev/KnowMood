import { describe, expect, it } from 'vitest'
import { MONSTER_FAMILY, MONSTER_SCENARIOS, MONSTER_SPEECH } from './monsterFamily'

describe('情緒小怪獸家族', () => {
  it('七隻怪獸用不同名稱、形狀和標記辨認', () => {
    expect(MONSTER_FAMILY).toHaveLength(7)
    for (const key of ['id', 'name', 'shape', 'mark']) {
      expect(new Set(MONSTER_FAMILY.map(monster => monster[key])).size).toBe(7)
    }
  })

  it('開心和興奮、害怕和擔心是分開的角色', () => {
    expect(MONSTER_FAMILY.find(m => m.id === 'bounce').emotion).toBe('開心')
    expect(MONSTER_FAMILY.find(m => m.id === 'spark').emotion).toBe('興奮')
    expect(MONSTER_FAMILY.find(m => m.id === 'tremble').emotion).toBe('害怕')
    expect(MONSTER_FAMILY.find(m => m.id === 'swirl').emotion).toBe('擔心')
  })

  it('自我情境沒有唯一正解，且固定引導語可補錄', () => {
    expect(MONSTER_SCENARIOS.every(([, suggestions]) => suggestions.length >= 3)).toBe(true)
    expect(MONSTER_SPEECH).toContain('沒有壞怪獸，每一種心情都值得被照顧。')
  })
})
