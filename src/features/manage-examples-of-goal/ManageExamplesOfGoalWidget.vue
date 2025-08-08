<template>
  <div class="space-y-4">
    <div v-if="examples.length === 0" class="text-center py-8 text-gray-500">
      No examples attached yet. Add some below to practice with specific sentences or phrases.
    </div>
    
    <div v-else class="space-y-2">
      <div
        v-for="example in examples"
        :key="example.uid"
        class="flex items-center gap-3 p-3 border border-base-200 rounded-lg"
      >
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <LanguageDisplay :language-code="example.language" compact />
            <span class="font-medium">{{ example.content || 'No content' }}</span>
          </div>
          <div v-if="example.translation" class="text-sm text-gray-600">
            → {{ example.translation }}
          </div>
        </div>
        <button
          @click="removeExample(example.uid)"
          class="btn btn-sm btn-error btn-outline"
        >
          Remove
        </button>
      </div>
    </div>

    <div class="divider">Add New Example</div>

    <FormFieldset legend="New Example Entry" layout="horizontal">
      <FormField label="Language" size="sm">
        <template #default="{ inputId }">
          <LanguageDropdown
            :id="inputId"
            v-model="newExample.language"
            placeholder="Select target language"
            required
            size="sm"
          />
        </template>
      </FormField>
      
      <FormField label="Content (Optional)" size="sm">
        <template #default="{ inputId, inputClassString }">
          <input
            :id="inputId"
            v-model="newExample.content"
            type="text"
            placeholder="e.g., Hola, ¿cómo estás?"
            :class="inputClassString"
          />
        </template>
      </FormField>
      
      <FormField label="Translation (Optional)" size="sm">
        <template #default="{ inputId, inputClassString }">
          <input
            :id="inputId"
            v-model="newExample.translation"
            type="text"
            placeholder="e.g., Hello, how are you?"
            :class="inputClassString"
            @keydown.enter="addExample"
          />
        </template>
      </FormField>
    </FormFieldset>

    <div class="flex justify-end">
      <button
        @click="addExample"
        :disabled="!canAddExample"
        class="btn btn-primary btn-sm"
      >
        Add Example
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { GoalData } from '@/entities/goals/GoalData';
import type { ExampleRepoContract } from '@/entities/examples/ExampleRepoContract';
import type { ExampleData } from '@/entities/examples/ExampleData';
import LanguageDropdown from '@/shared/ui/LanguageDropdown.vue';
import LanguageDisplay from '@/shared/ui/LanguageDisplay.vue';
import FormFieldset from '@/shared/ui/FormFieldset.vue';
import FormField from '@/shared/ui/FormField.vue';

const props = defineProps<{
  goal: GoalData;
}>();

const emit = defineEmits<{
  'goal-updated': [GoalData];
}>();

const goalRepo = inject<GoalRepoContract>('goalRepo')!;
const exampleRepo = inject<ExampleRepoContract>('exampleRepo')!;

const examples = ref<ExampleData[]>([]);
const newExample = ref({
  language: '',
  content: '',
  translation: ''
});

const canAddExample = computed(() => {
  return newExample.value.language.trim() && 
         (newExample.value.content.trim() || newExample.value.translation.trim());
});

async function loadExamples() {
  const examplePromises = props.goal.examples.map(id => exampleRepo.getExampleById(id));
  const exampleResults = await Promise.all(examplePromises);
  examples.value = exampleResults.filter((e): e is ExampleData => e !== undefined);
}

async function addExample() {
  if (!canAddExample.value) return;
  
  const example = await exampleRepo.saveExample({
    language: newExample.value.language.trim(),
    content: newExample.value.content.trim() || undefined,
    translation: newExample.value.translation.trim() || undefined,
    associatedVocab: [],
    tasks: [],
    isUserCreated: true,
    lastDownloadedAt: null
  });
  
  // Update goal to include this example
  const updatedGoal = await goalRepo.update(props.goal.uid, {
    examples: [...props.goal.examples, example.uid]
  });
  
  examples.value.push(example);
  newExample.value = { language: '', content: '', translation: '' };
  emit('goal-updated', updatedGoal);
}

async function removeExample(exampleId: string) {
  if (!confirm('Are you sure you want to remove this example from the goal?')) return;
  
  // Remove from goal's examples array
  const updatedExamples = props.goal.examples.filter(id => id !== exampleId);
  const updatedGoal = await goalRepo.update(props.goal.uid, {
    examples: updatedExamples
  });
  
  // Update local state
  examples.value = examples.value.filter(e => e.uid !== exampleId);
  emit('goal-updated', updatedGoal);
}

onMounted(loadExamples);
</script>