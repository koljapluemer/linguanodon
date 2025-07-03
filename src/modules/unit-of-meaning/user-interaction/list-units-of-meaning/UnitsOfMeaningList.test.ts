import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UnitsOfMeaningList from './UnitsOfMeaningList.vue'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

const units: UnitOfMeaning[] = [
  { uid: 'u1', language: 'en', content: 'cat', linguType: 'noun', userCreated: true, context: '', translations: ['u2'] },
  { uid: 'u2', language: 'de', content: 'Katze', linguType: 'noun', userCreated: true, context: '', translations: [] },
  { uid: 'u3', language: 'en', content: 'dog', linguType: 'noun', userCreated: true, context: '', translations: [] },
]

const targetLangs = ['en']
const nativeLangs = ['de']

describe('UnitsOfMeaningList', () => {
  it('filters by target language by default (main content only)', () => {
    const wrapper = mount(UnitsOfMeaningList, {
      props: { units, targetLangs, nativeLangs, initiallyFilterBy: 'target' }
    })
    const rows = wrapper.findAll('tbody tr')
    const mainContents = rows.map(row => row.find('td').text())
    expect(mainContents).toContain('cat')
    expect(mainContents).toContain('dog')
    expect(mainContents).not.toContain('Katze')
  })

  it('filters by native language when toggled (main content only)', async () => {
    const wrapper = mount(UnitsOfMeaningList, {
      props: { units, targetLangs, nativeLangs, initiallyFilterBy: 'target' }
    })
    await wrapper.findAll('button')[1].trigger('click')
    const rows = wrapper.findAll('tbody tr')
    const mainContents = rows.map(row => row.find('td').text())
    expect(mainContents).toContain('Katze')
    expect(mainContents).not.toContain('cat')
    expect(mainContents).not.toContain('dog')
  })

  it('renders translation badges for units with translations', () => {
    const wrapper = mount(UnitsOfMeaningList, {
      props: { units, targetLangs, nativeLangs, initiallyFilterBy: 'target' }
    })
    // 'cat' has translation 'Katze'
    const catRow = wrapper.findAll('tbody tr').find(row => row.text().includes('cat'))
    expect(catRow?.html()).toContain('badge')
    expect(catRow?.text()).toContain('Katze')
  })

  it('shows nothing for missing translation UIDs', () => {
    const unitsWithMissing = [
      { ...units[0], translations: ['notfound'] },
      ...units.slice(1)
    ]
    const wrapper = mount(UnitsOfMeaningList, {
      props: { units: unitsWithMissing, targetLangs, nativeLangs, initiallyFilterBy: 'target' }
    })
    const catRow = wrapper.findAll('tbody tr').find(row => row.text().includes('cat'))
    // Should not render any badge for missing translation
    expect(catRow?.html()).not.toContain('badge')
  })

  it('reacts to prop changes (initiallyFilterBy, main content only)', async () => {
    const wrapper = mount(UnitsOfMeaningList, {
      props: { units, targetLangs, nativeLangs, initiallyFilterBy: 'native' }
    })
    let rows = wrapper.findAll('tbody tr')
    let mainContents = rows.map(row => row.find('td').text())
    expect(mainContents).toContain('Katze')
    expect(mainContents).not.toContain('cat')
    await wrapper.setProps({ initiallyFilterBy: 'target' })
    rows = wrapper.findAll('tbody tr')
    mainContents = rows.map(row => row.find('td').text())
    expect(mainContents).toContain('cat')
    expect(mainContents).not.toContain('Katze')
  })
}) 