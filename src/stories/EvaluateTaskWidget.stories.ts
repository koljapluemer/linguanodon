import type { Meta, StoryObj } from '@storybook/vue3';
import EvaluateTaskWidget from '@/features/evaluate-task-widget/EvaluateTaskWidget.vue';

const meta: Meta<typeof EvaluateTaskWidget> = {
  title: 'Features/EvaluateTaskWidget',
  component: EvaluateTaskWidget,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Task evaluation widget that collects user feedback after completing a task. Includes correctness rating (1-5), difficulty rating (1-5), and preference for repeating the task (No/Maybe/Yes).',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (story) => ({
      components: { story },
      template: '<div style="max-width: 600px; padding: 20px;"><story /></div>',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default evaluation widget with all controls in their initial state.',
      },
    },
  },
};

export const PrefilledRatings: Story = {
  render: (args) => ({
    components: { EvaluateTaskWidget },
    setup() {
      // This is a hack to prefill values for demonstration
      // In reality, the component manages its own state
      return { args };
    },
    mounted() {
      // Simulate user interaction by programmatically setting values
      setTimeout(() => {
        const correctnessSlider = this.$el.querySelector('input[type="range"]:first-of-type');
        const difficultySlider = this.$el.querySelector('input[type="range"]:last-of-type');
        const yesButton = this.$el.querySelector('button:contains("Yes")');
        
        if (correctnessSlider) correctnessSlider.value = '4';
        if (difficultySlider) difficultySlider.value = '2';
        // Note: The buttons would need actual interaction to work properly
      }, 100);
    },
    template: '<EvaluateTaskWidget v-bind="args" />',
  }),
  parameters: {
    docs: {
      description: {
        story: 'Example showing how the widget might look with user-selected values.',
      },
    },
  },
};

export const HighPerformance: Story = {
  render: () => ({
    components: { EvaluateTaskWidget },
    data() {
      return {
        mockCorrectness: 5,
        mockDifficulty: 1,
        mockWantToDoAgain: 'no'
      };
    },
    template: `
      <div class="space-y-6">
        <div class="text-center">
          <h3 class="text-xl font-bold mb-2">How was that task?</h3>
          <p class="text-base-content/70">Please rate your experience</p>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body space-y-6">
            <!-- Correctness Rating -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">How well did you do?</span>
                <span class="label-text-alt">{{ mockCorrectness }}/5</span>
              </label>
              <input 
                v-model.number="mockCorrectness"
                type="range" 
                min="1" 
                max="5" 
                class="range range-primary" 
              />
              <div class="w-full flex justify-between text-xs px-2">
                <span>Poor</span>
                <span>Perfect</span>
              </div>
            </div>

            <!-- Difficulty Rating -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">How difficult was it?</span>
                <span class="label-text-alt">{{ mockDifficulty }}/5</span>
              </label>
              <input 
                v-model.number="mockDifficulty"
                type="range" 
                min="1" 
                max="5" 
                class="range range-secondary" 
              />
              <div class="w-full flex justify-between text-xs px-2">
                <span>Easy</span>
                <span>Very Hard</span>
              </div>
            </div>

            <!-- Want to do again -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Do this task again in the future?</span>
              </label>
              <div class="flex gap-2 justify-center">
                <button 
                  class="btn btn-sm btn-error"
                  @click="mockWantToDoAgain = 'no'"
                >
                  No
                </button>
                <button 
                  class="btn btn-sm btn-outline"
                >
                  Maybe
                </button>
                <button 
                  class="btn btn-sm btn-outline"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <button class="btn btn-primary">
            Continue
          </button>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Simulated state showing perfect performance (5/5), very easy difficulty (1/5), and "No" for repeat - typical for a task that was mastered.',
      },
    },
  },
};

export const StruggleSession: Story = {
  render: () => ({
    components: { EvaluateTaskWidget },
    data() {
      return {
        mockCorrectness: 2,
        mockDifficulty: 5,
        mockWantToDoAgain: 'yes'
      };
    },
    template: `
      <div class="space-y-6">
        <div class="text-center">
          <h3 class="text-xl font-bold mb-2">How was that task?</h3>
          <p class="text-base-content/70">Please rate your experience</p>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body space-y-6">
            <!-- Correctness Rating -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">How well did you do?</span>
                <span class="label-text-alt">{{ mockCorrectness }}/5</span>
              </label>
              <input 
                v-model.number="mockCorrectness"
                type="range" 
                min="1" 
                max="5" 
                class="range range-primary" 
              />
              <div class="w-full flex justify-between text-xs px-2">
                <span>Poor</span>
                <span>Perfect</span>
              </div>
            </div>

            <!-- Difficulty Rating -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">How difficult was it?</span>
                <span class="label-text-alt">{{ mockDifficulty }}/5</span>
              </label>
              <input 
                v-model.number="mockDifficulty"
                type="range" 
                min="1" 
                max="5" 
                class="range range-secondary" 
              />
              <div class="w-full flex justify-between text-xs px-2">
                <span>Easy</span>
                <span>Very Hard</span>
              </div>
            </div>

            <!-- Want to do again -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Do this task again in the future?</span>
              </label>
              <div class="flex gap-2 justify-center">
                <button 
                  class="btn btn-sm btn-outline"
                >
                  No
                </button>
                <button 
                  class="btn btn-sm btn-outline"
                >
                  Maybe
                </button>
                <button 
                  class="btn btn-sm btn-success"
                  @click="mockWantToDoAgain = 'yes'"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <button class="btn btn-primary">
            Continue
          </button>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Simulated state showing poor performance (2/5), very difficult (5/5), and "Yes" for repeat - typical for a challenging task that needs more practice.',
      },
    },
  },
};

export const ModerateExperience: Story = {
  render: () => ({
    components: { EvaluateTaskWidget },
    data() {
      return {
        mockCorrectness: 3,
        mockDifficulty: 3,
        mockWantToDoAgain: 'maybe'
      };
    },
    template: `
      <div class="space-y-6">
        <div class="text-center">
          <h3 class="text-xl font-bold mb-2">How was that task?</h3>
          <p class="text-base-content/70">Please rate your experience</p>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body space-y-6">
            <!-- Correctness Rating -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">How well did you do?</span>
                <span class="label-text-alt">{{ mockCorrectness }}/5</span>
              </label>
              <input 
                v-model.number="mockCorrectness"
                type="range" 
                min="1" 
                max="5" 
                class="range range-primary" 
              />
              <div class="w-full flex justify-between text-xs px-2">
                <span>Poor</span>
                <span>Perfect</span>
              </div>
            </div>

            <!-- Difficulty Rating -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">How difficult was it?</span>
                <span class="label-text-alt">{{ mockDifficulty }}/5</span>
              </label>
              <input 
                v-model.number="mockDifficulty"
                type="range" 
                min="1" 
                max="5" 
                class="range range-secondary" 
              />
              <div class="w-full flex justify-between text-xs px-2">
                <span>Easy</span>
                <span>Very Hard</span>
              </div>
            </div>

            <!-- Want to do again -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Do this task again in the future?</span>
              </label>
              <div class="flex gap-2 justify-center">
                <button 
                  class="btn btn-sm btn-outline"
                >
                  No
                </button>
                <button 
                  class="btn btn-sm btn-warning"
                  @click="mockWantToDoAgain = 'maybe'"
                >
                  Maybe
                </button>
                <button 
                  class="btn btn-sm btn-outline"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <button class="btn btn-primary">
            Continue
          </button>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Simulated state showing moderate performance and difficulty (3/5 each) with "Maybe" for repeat - typical for a task at the appropriate challenge level.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  play: async ({ canvasElement }) => {
    console.log('Interactive demo ready - try adjusting the sliders and clicking the buttons');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing the evaluation flow. Try adjusting the rating sliders and selecting different options for repetition.',
      },
    },
  },
};

export const DisabledState: Story = {
  render: () => ({
    components: { EvaluateTaskWidget },
    template: `
      <div class="space-y-6">
        <div class="text-center">
          <h3 class="text-xl font-bold mb-2">How was that task?</h3>
          <p class="text-base-content/70">Please rate your experience</p>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body space-y-6">
            <!-- Correctness Rating -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">How well did you do?</span>
                <span class="label-text-alt">?/5</span>
              </label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                class="range range-primary" 
              />
              <div class="w-full flex justify-between text-xs px-2">
                <span>Poor</span>
                <span>Perfect</span>
              </div>
            </div>

            <!-- Difficulty Rating -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">How difficult was it?</span>
                <span class="label-text-alt">?/5</span>
              </label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                class="range range-secondary" 
              />
              <div class="w-full flex justify-between text-xs px-2">
                <span>Easy</span>
                <span>Very Hard</span>
              </div>
            </div>

            <!-- Want to do again -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Do this task again in the future?</span>
              </label>
              <div class="flex gap-2 justify-center">
                <button class="btn btn-sm btn-outline">No</button>
                <button class="btn btn-sm btn-outline">Maybe</button>
                <button class="btn btn-sm btn-outline">Yes</button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <button class="btn btn-primary" disabled>
            Continue
          </button>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Shows the initial state with disabled Continue button, demonstrating that all fields must be completed before submission.',
      },
    },
  },
};