import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ManageUnitOfMeaning from './ManageUnitOfMeaning.vue'

describe('ManageUnitOfMeaning.vue', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders without crashing', () => {
    const wrapper = mount(ManageUnitOfMeaning, { props: { uid: 'test-uid' } })
    expect(wrapper.exists()).toBe(true)
  })
}) 