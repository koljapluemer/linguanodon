import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ManageUnitOfMeaning from './ManageUnitOfMeaning.vue'

describe('ManageUnitOfMeaning.vue', () => {
  it('renders ready state and displays UID', () => {
    const wrapper = mount(ManageUnitOfMeaning, {
      props: { uid: 'abc-123' }
    })
    expect(wrapper.text()).toContain('Manage Unit of Meaning')
    expect(wrapper.html()).toContain('abc-123')
  })

  it('renders ready state without UID', () => {
    const wrapper = mount(ManageUnitOfMeaning)
    expect(wrapper.text()).toContain('Manage Unit of Meaning')
    // Should not display any UID string
    expect(wrapper.html()).not.toContain('abc-123')
    // Check for the fallback string
    expect(wrapper.text()).toContain('No word or Sentence found')
  })
}) 