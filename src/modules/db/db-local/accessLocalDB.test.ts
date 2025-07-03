import { describe, it, expect } from 'vitest'
import { db } from './accessLocalDB'

// This test will fail if Dexie.Table is not available or used correctly

describe('Dexie DB instance', () => {
  it('should instantiate and have learningGoals and unitsOfMeaning tables', () => {
    expect(db).toBeDefined()
    expect(db.learningGoals).toBeDefined()
    expect(db.unitsOfMeaning).toBeDefined()
  })
}) 