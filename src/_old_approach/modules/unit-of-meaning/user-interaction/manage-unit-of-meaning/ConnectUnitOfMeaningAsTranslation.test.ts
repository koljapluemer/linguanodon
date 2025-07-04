import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConnectUnitOfMeaningAsTranslation from './ConnectUnitOfMeaningAsTranslation.vue'

describe('ConnectUnitOfMeaningAsTranslation.vue', () => {
  it('renders modal with search input, results dropdown, and two buttons', () => {
    const wrapper = mount(ConnectUnitOfMeaningAsTranslation, {
      props: { oppositeLanguageGroup: 'target' }
    })
    // Modal is present
    expect(wrapper.find('dialog.modal').exists()).toBe(true)
    // Search input is present
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    // Results dropdown is present
    expect(wrapper.find('select').exists()).toBe(true)
    // There are two buttons in the modal action area
    expect(wrapper.findAll('.modal-action button').length).toBe(2)
  })

  it('filters results dropdown based on search input', async () => {
    const wrapper = mount(ConnectUnitOfMeaningAsTranslation, {
      props: { oppositeLanguageGroup: 'target' }
    })
    // Initially, all mock options are present
    let options = wrapper.findAll('select option')
    expect(options.length).toBe(3)
    // Type 'Bon' in the search input
    await wrapper.find('input[type="text"]').setValue('Bon')
    options = wrapper.findAll('select option')
    expect(options.length).toBe(1)
    expect(options[0].text()).toContain('Bonjour')
    // Type 'Ciao' in the search input
    await wrapper.find('input[type="text"]').setValue('Ciao')
    options = wrapper.findAll('select option')
    expect(options.length).toBe(1)
    expect(options[0].text()).toContain('Ciao')
    // Type 'xyz' in the search input (no match)
    await wrapper.find('input[type="text"]').setValue('xyz')
    options = wrapper.findAll('select option')
    expect(options.length).toBe(0)
  })
}) 