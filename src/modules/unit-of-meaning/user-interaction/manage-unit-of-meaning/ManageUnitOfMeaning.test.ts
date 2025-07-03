import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ManageUnitOfMeaning from './ManageUnitOfMeaning.vue'
import UnitOfMeaningForm from './UnitOfMeaningForm.vue'
import TranslationsWidget from './TranslationsWidget.vue'
import * as dbComposable from '@/modules/unit-of-meaning/utils/useUnitOfMeaningDB'

const mockUnit = {
  uid: 'u1',
  language: 'en',
  content: 'Hello',
  linguType: 'word',
  userCreated: true,
  context: 'greeting',
  translations: ['t1', 't2']
}
const mockTranslations = [
  { uid: 't1', content: 'Hallo', language: 'de', linguType: 'word', userCreated: true, context: 'greeting' },
  { uid: 't2', content: 'Hola', language: 'es', linguType: 'word', userCreated: true, context: 'greeting' }
]

describe('ManageUnitOfMeaning.vue', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('passes correct props to UnitOfMeaningForm and TranslationsWidget', async () => {
    vi.spyOn(dbComposable, 'getUnitOfMeaningById').mockResolvedValue(mockUnit)
    const getTrans = vi.spyOn(dbComposable, 'getUnitOfMeaningById')
    getTrans.mockImplementation(uid => {
      if (uid === 'u1') return Promise.resolve(mockUnit)
      return Promise.resolve(mockTranslations.find(t => t.uid === uid))
    })
    const wrapper = mount(ManageUnitOfMeaning, { props: { uid: 'u1' } })
    await wrapper.vm.$nextTick()
    // Wait for translations fetch
    await new Promise(r => setTimeout(r, 0))
    const form = wrapper.findComponent(UnitOfMeaningForm)
    expect(form.exists()).toBe(true)
    expect(form.props('unit')).toMatchObject(mockUnit)
    const widget = wrapper.findComponent(TranslationsWidget)
    expect(widget.exists()).toBe(true)
    expect(widget.props('translations')).toEqual(mockTranslations)
  })

  it('fetches and passes correct translation units to TranslationsWidget', async () => {
    vi.spyOn(dbComposable, 'getUnitOfMeaningById').mockImplementation(uid => {
      if (uid === 'u1') return Promise.resolve(mockUnit)
      return Promise.resolve(mockTranslations.find(t => t.uid === uid))
    })
    const wrapper = mount(ManageUnitOfMeaning, { props: { uid: 'u1' } })
    await wrapper.vm.$nextTick()
    // Wait for translations fetch
    await new Promise(r => setTimeout(r, 0))
    const widget = wrapper.findComponent(TranslationsWidget)
    expect(widget.props('translations')).toEqual(mockTranslations)
  })
}) 