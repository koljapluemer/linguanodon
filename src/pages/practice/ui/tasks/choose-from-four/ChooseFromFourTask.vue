<script setup lang="ts">
import { ref } from "vue";
import type { ChooseFromFourExercise } from "../../../model/Exercise";
import WidgetBigText from "@/shared/WidgetBigText.vue";
import WidgetInstruction from "@/shared/WidgetInstruction.vue";

interface Props {
    exercise: ChooseFromFourExercise;
}

interface Emits {
    (e: 'rate', rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const selectedIndex = ref<number | null>(null);
const isAnswered = ref(false);

/**
 * Gets the prompt from exercise data.
 */
function getPrompt(): string {
    return props.exercise.prompt;
}

/**
 * Gets the linguistic unit from exercise data.
 */
function getLinguisticUnit() {
    return props.exercise.linguisticUnit;
}

/**
 * Gets the linguistic unit content.
 */
function getLinguisticUnitContent(): string {
    const unit = getLinguisticUnit() as { content: string };
    return unit.content;
}

/**
 * Checks if the linguistic unit is a word.
 */
function isWord(): boolean {
    const unit = getLinguisticUnit() as { type: string };
    return unit.type === 'word';
}

/**
 * Handles option selection.
 */
function selectOption(index: number) {
    if (isAnswered.value) return;

    selectedIndex.value = index;
    const isCorrect = props.exercise.answerOptions[index].isCorrect;

    if (isCorrect) {
        // Correct answer: make green and proceed after 100ms
        isAnswered.value = true;
        setTimeout(() => {
            emit('rate', 'Easy');
        }, 100);
    } else {
        // Wrong answer: just disable the button, don't proceed yet
        // User can still click the correct answer
    }
}

/**
 * Gets button class based on selection state.
 */
function getButtonClass(index: number): string {
    const isCorrect = props.exercise.answerOptions[index].isCorrect;
    const isSelected = index === selectedIndex.value;

    if (isCorrect && isSelected) {
        // Correct answer was selected
        return 'btn btn-success btn-xl';
    }

    if (!isCorrect && isSelected) {
        // Wrong answer was selected
        return 'btn btn-error btn-xl';
    }

    if (isAnswered.value && isCorrect) {
        // Show correct answer when exercise is complete
        return 'btn btn-success btn-xl';
    }

    if (isAnswered.value && !isCorrect) {
        // Disable wrong answers when exercise is complete
        return 'btn btn-outline btn-xl opacity-50';
    }

    // Default state
    return 'btn btn-outline btn-xl';
}

/**
 * Checks if a button should be disabled.
 */
function isButtonDisabled(index: number): boolean {
    const isCorrect = props.exercise.answerOptions[index].isCorrect;
    const isSelected = index === selectedIndex.value;

    // Disable if exercise is answered
    if (isAnswered.value) return true;

    // Disable if this wrong option was selected
    if (!isCorrect && isSelected) return true;

    return false;
}
</script>

<template>
    <!-- Task Instruction -->
    <WidgetInstruction>
        {{ getPrompt() }}
    </WidgetInstruction>

    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <!-- Front (Linguistic Unit Content) -->
            <div class="mb-6 text-center">
                <WidgetBigText :is-extra-big="isWord()">
                    {{ getLinguisticUnitContent() }}
                </WidgetBigText>
            </div>


        </div>
    </div>

    <!-- Options -->
    <div class="flex justify-center gap-4">
        <button v-for="(option, index) in exercise.answerOptions" :key="index" :class="getButtonClass(index)"
            :disabled="isButtonDisabled(index)" @click="selectOption(index)">
            {{ option.content }}
        </button>
    </div>
</template>