<template>
  <div class="space-y-4">
    <!-- Task Instruction -->
    <ElementInstruction>
      Attempt to translate this sentence
    </ElementInstruction>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <!-- Front (Example Content) -->
        <div class="mb-4 text-center">
          <ElementBigText :is-extra-big="false">
            {{ getExampleContent() }}
          </ElementBigText>
        </div>

        <!-- Translation Input -->
        <div v-if="!isRevealed" class="mb-4">
          <ElementImportantTextArea 
            v-model="userInput" 
            placeholder="Type your translation here..." 
          />
        </div>

        <!-- Solution (when revealed) -->
        <div v-if="isRevealed">
          <!-- Dashed Line -->
          <div class="border-t-2 md:border-dotted border-base-300 my-4"></div>

          <!-- Back (Translation) -->
          <div class="mb-6 text-center">
            <ElementBigText :is-extra-big="false">
              {{ getExampleTranslation() }}
            </ElementBigText>

            <!-- User's Answer (if provided) -->
            <div v-if="userInput" class="mt-4 p-3 bg-warning/10 rounded-lg border border-warning/20">
              <p class="text-sm font-medium text-warning-content">Your Answer:</p>
              <p class="whitespace-pre-line">{{ userInput }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reveal Button -->
    <ElementRevealButton v-if="!isRevealed" @click="isRevealed = true" />

    <!-- Rating (when revealed) -->
    <RatingButtons 
      v-if="isRevealed" 
      prompt="How difficult was this to translate?"
      @rate="handleRate" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import type { ExampleData } from '@/entities/examples/ExampleData';
import type { ExampleRepoContract } from '@/entities/examples/ExampleRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import ElementBigText from '@/shared/ui/ElementBigText.vue';
import ElementInstruction from '@/shared/ui/ElementInstruction.vue';
import ElementImportantTextArea from '@/shared/ui/ElementImportantTextArea.vue';
import ElementRevealButton from '@/shared/ui/ElementRevealButton.vue';
import RatingButtons from '@/shared/ui/RatingButtons.vue';

interface Props {
  taskData: {
    exampleId: string;
    example: ExampleData;
  };
}

interface Emits {
  (e: 'complete', rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const exampleRepo = inject<ExampleRepoContract>('exampleRepo');
const taskRepo = inject<TaskRepoContract>('taskRepo')!;

const userInput = ref('');
const isRevealed = ref(false);

function getExampleContent(): string {
  return props.taskData.example.content || 'No content provided';
}

function getExampleTranslation(): string {
  return props.taskData.example.translation || 'No translation provided';
}

async function handleRate(rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy') {
  // Determine if user wants to do this again based on rating
  const wantToDoAgain = rating === 'Impossible' || rating === 'Hard';
  
  // Update the example's associated tasks
  if (exampleRepo) {
    try {
      const example = props.taskData.example;
      
      // Create and save a proper free-translate task
      const freeTranslateTask = {
        uid: `free-translate-${example.uid}-${Date.now()}`,
        taskType: 'free-translate' as const,
        title: `Free translate: ${example.content}`,
        prompt: 'Translate this example to practice your understanding',
        evaluateCorrectnessAndConfidenceAfterDoing: true,
        decideWhetherToDoAgainAfterDoing: true,
        isActive: true,
        taskSize: 'medium' as const,
        associatedUnits: [{ type: 'Example' as const, uid: example.uid }],
        lastShownAt: new Date(),
        lastDifficultyRating: rating === 'Impossible' ? 1 : 
                             rating === 'Hard' ? 2 : 
                             rating === 'Doable' ? 3 : 4,
        nextShownEarliestAt: new Date(Date.now() + (wantToDoAgain ? 24 : 168) * 60 * 60 * 1000)
      };
      
      // Save task to TaskRepo
      await taskRepo.saveTask(freeTranslateTask);
      
      // Add task to example's tasks array  
      const updatedExample = {
        ...example,
        tasks: [...(example.tasks || []), freeTranslateTask.uid]
      };
      
      // Save updated example
      await exampleRepo!.updateExample(updatedExample);
    } catch (error) {
      console.error('Error updating example task data:', error);
    }
  }
  
  emit('complete', rating);
}
</script>