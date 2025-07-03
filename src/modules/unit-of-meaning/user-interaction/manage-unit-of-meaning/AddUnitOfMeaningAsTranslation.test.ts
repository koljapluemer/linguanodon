import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AddUnitOfMeaningAsTranslation from './AddUnitOfMeaningAsTranslation.vue'
import UnitOfMeaningForm from './UnitOfMeaningForm.vue'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

describe('AddUnitOfMeaningAsTranslation.vue', () => {
  it('renders modal with UnitOfMeaningForm and two buttons', () => {
    const wrapper = mount(AddUnitOfMeaningAsTranslation)
    // Modal is present
    expect(wrapper.find('dialog.modal').exists()).toBe(true)
    // UnitOfMeaningForm is present
    expect(wrapper.findComponent(UnitOfMeaningForm).exists()).toBe(true)
    // There are two buttons in the modal action area
    expect(wrapper.findAll('.modal-action button').length).toBe(2)
  })

  it('passes correct props to UnitOfMeaningForm', () => {
    const wrapper = mount(AddUnitOfMeaningAsTranslation)
    const form = wrapper.findComponent(UnitOfMeaningForm)
    const unitProp = form.props('unit') as UnitOfMeaning
    expect(unitProp.language).toBe('fr')
    expect(form.props('showTranslations')).toBe(false)
  })
}) 