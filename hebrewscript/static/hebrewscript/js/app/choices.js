// @ts-check
// Vue component (global build) - port of PracticeSessionChoices.vue. Keeps
// dir="rtl" on the transcript span, unlike viettonepractice's port of the
// same component: Hebrew is right-to-left, Vietnamese is not.

export const ChoicesComponent = {
  props: ["options", "clipFilename", "disabledButtonIndex", "changedCharacterIndex", "splitLabel"],
  emits: ["select"],
  template: `
    <div class="grid gap-4 sm:grid-cols-2">
      <button
        v-for="(option, index) in options"
        :key="clipFilename + '-' + index + '-' + option.label"
        class="btn btn-2xl btn-outline h-auto flex-row items-center justify-between gap-3"
        :disabled="disabledButtonIndex === index"
        @click="$emit('select', option, index)"
      >
        <kbd v-if="index === 0" class="kbd kbd-sm">←</kbd>
        <span dir="rtl" class="text-2xl whitespace-pre-wrap">
          <span
            v-for="(character, characterIndex) in splitLabel(option.label)"
            :key="option.label + '-' + characterIndex"
            :class="{ 'text-marker': characterIndex === changedCharacterIndex }"
          >{{ character }}</span>
        </span>
        <kbd v-if="index !== 0" class="kbd kbd-sm">→</kbd>
      </button>
    </div>
  `,
};
