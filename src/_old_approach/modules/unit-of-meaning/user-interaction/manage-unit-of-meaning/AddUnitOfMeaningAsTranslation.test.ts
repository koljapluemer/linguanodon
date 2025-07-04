import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AddUnitOfMeaningAsTranslation from './AddUnitOfMeaningAsTranslation.vue'
import UnitOfMeaningForm from './UnitOfMeaningForm.vue'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'
import type { UserSettings } from '@/modules/user-settings/UserSettings'

// Mock the user settings
const mockUserSettings: UserSettings = {
  primaryNativeLanguages: ['fr', 'de'],
  primaryTargetLanguages: ['en'],
  secondaryTargetLanguages: [],
  secondaryNativeLanguages: [],
  // add any other required UserSettings fields here
}

vi.mock('@/modules/user-settings/utils/useUserSettingsDB', () => ({
  useUserSettings: () => ({
    userSettings: { value: mockUserSettings }
  })
}))

// Mock the database function
vi.mock('@/modules/unit-of-meaning/utils/useUnitOfMeaningDB', () => ({
  addUnitOfMeaning: vi.fn()
}))

describe('AddUnitOfMeaningAsTranslation.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders modal with UnitOfMeaningForm and two buttons', () => {
    const wrapper = mount(AddUnitOfMeaningAsTranslation)
    // Modal is present
    expect(wrapper.find('dialog.modal').exists()).toBe(true)
    // UnitOfMeaningForm is present
    expect(wrapper.findComponent(UnitOfMeaningForm).exists()).toBe(true)
    // There are two buttons in the modal action area
    expect(wrapper.findAll('.modal-action button').length).toBe(2)
  })

  it('passes correct props to UnitOfMeaningForm', async () => {
    const parentUnit: UnitOfMeaning = {
      uid: 'parent1',
      language: 'en',
      content: 'Hello',
      linguType: 'word',
      userCreated: true,
      context: ''
    }
    const wrapper = mount(AddUnitOfMeaningAsTranslation, {
      props: { parentUnit }
    })
    
    // Wait for onMounted to complete
    await wrapper.vm.$nextTick()
    
    const form = wrapper.findComponent(UnitOfMeaningForm)
    const unitProp = form.props('unit') as UnitOfMeaning
    expect(unitProp.language).toBe('fr') // French is the first native language
    expect(form.props('showTranslations')).toBe(false)
  })
}) 