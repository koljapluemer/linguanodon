<template>
  <div class="max-w-4xl mx-auto mt-8 p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">
        {{ isEditing ? 'Edit Vocab' : 'Add New Vocab' }}
      </h1>
      <router-link to="/vocab" class="btn btn-outline">
        Back to Vocab List
      </router-link>
    </div>

    <!-- Vocab Form -->
    <div class="max-w-2xl mx-auto">
      <!-- Loading State -->
      <div v-if="state.loading" class="text-center py-8">
        <span class="loading loading-spinner loading-lg"></span>
        <p class="mt-4">Loading vocab...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="state.error" class="alert alert-error mb-6">
        <span>{{ state.error }}</span>
      </div>

      <!-- Form -->
      <div v-else class="space-y-6">
        <!-- Core Content -->
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <h2 class="text-lg font-semibold pb-4">Vocabulary Details</h2>
          
          <InlineInput
            v-model="state.formData.content"
            label="Content"
            placeholder="The word or phrase"
            required
          />

          <InlineLanguageSelect
            v-model="state.formData.language"
            label="Language"
            placeholder="Select target language"
            required
          />

          <InlineInput
            v-model="state.formData.priority"
            label="Priority"
            type="number"
            :min="1"
            :max="5"
            placeholder="1"
          />

          <InlineToggle
            v-model="state.formData.doNotPractice"
            label="Exclude from practice"
          />
        </div>

        <!-- Translations -->
        <div class="mt-8">
          <h2 class="text-lg font-semibold mb-4">Translations</h2>
          <TranslationGroupForm
            v-model="state.formData.translations"
            :allow-edit-on-click="true"
            :show-delete-button="true"
            :allow-adding-new="true"
          />
        </div>

        <!-- Notes -->
        <div class="mt-8">
          <h2 class="text-lg font-semibold mb-4">Notes</h2>
          
          <NoteList
            :notes="state.formData.notes"
            :show-before-exercise-option="true"
            @add="addNote"
            @update="updateNote"
            @delete="removeNote"
          />
        </div>

        <!-- Links -->
        <div class="mt-8">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">Links</h2>
            <button
              type="button"
              @click="addLink"
              class="btn btn-sm btn-outline"
            >
              <Plus class="w-4 h-4 mr-1" />
              Add Link
            </button>
          </div>
          
          <div v-if="state.formData.links.length === 0" class="text-gray-500 text-center py-4">
            No links yet. Click "Add Link" to add external resources.
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="(link, index) in state.formData.links"
              :key="index"
              class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 divide-y divide-gray-200 dark:divide-gray-700"
            >
              <InlineInput
                v-model="link.label"
                label="Link label"
                placeholder="Link label"
              />
              
              <div class="flex items-center justify-between pt-2">
                <div class="flex-1">
                  <InlineInput
                    v-model="link.url"
                    label="URL"
                    type="url"
                    placeholder="https://..."
                  />
                </div>
                <button
                  type="button"
                  @click="removeLink(index)"
                  class="ml-4 btn btn-sm btn-ghost btn-circle text-error flex-shrink-0"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Auto-save Status -->
        <div class="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2">
            <span v-if="state.saving" class="text-sm text-base-content/70 flex items-center gap-1">
              <span class="loading loading-spinner loading-sm"></span>
              Auto-saving...
            </span>
            <span v-else-if="state.isEditing" class="text-sm text-success flex items-center gap-1">
              <Check class="w-4 h-4" />
              Changes saved automatically
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Debug Component -->
    <DebugVocabProgress v-if="loadedVocabData" :vocab-data="loadedVocabData" />

    <!-- Associated Tasks -->
    <div v-if="isEditing" class="mt-8">
      <VocabTaskList 
        :vocab-id="route.params.id as string" 
        @task-selected="openTaskModal"
      />
    </div>

    <TaskModal 
      ref="taskModal"
      :task="currentTask"
      @finished="handleTaskFinished"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Plus, X, Check } from 'lucide-vue-next';
import { useVocabForm } from './useVocabForm';
import InlineInput from '@/shared/ui/InlineInput.vue';
import InlineLanguageSelect from '@/shared/ui/InlineLanguageSelect.vue';
import InlineToggle from '@/shared/ui/InlineToggle.vue';
import NoteList from '@/entities/notes/NoteList.vue';
import TranslationGroupForm from '@/entities/vocab/translations/TranslationGroupForm.vue';
import DebugVocabProgress from '@/shared/ui/DebugVocabProgress.vue';
import VocabTaskList from '@/widgets/vocab-task-list/VocabTaskListWidget.vue';
import TaskModal from '@/entities/tasks/TaskModal.vue';
import { UpdateVocabTasksController } from '@/features/vocab-update-tasks/UpdateVocabTasksController';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { Task } from '@/entities/tasks/Task';

const route = useRoute();
const taskModal = ref<InstanceType<typeof TaskModal>>();
const currentTask = ref<Task>();

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
const taskRepo = inject<TaskRepoContract>('taskRepo');

const isEditing = computed(() => {
  return route.params.id && route.params.id !== 'new';
});

// Use the vocab form composable
const { state, loadedVocabData, loadVocab, addNote, updateNote, removeNote, addLink, removeLink } = useVocabForm(
  route.params.id as string, 
  (vocabId: string) => handleVocabSaved(vocabId)
);

// Load vocab data on mount if editing
onMounted(() => {
  if (route.params.id && route.params.id !== 'new') {
    loadVocab();
  }
});

const openTaskModal = async (task: TaskData) => {
  currentTask.value = {
    ...task,
    mayBeConsideredDone: false,
    isDone: false
  };
  taskModal.value?.show();
};

const handleTaskFinished = async () => {
  currentTask.value = undefined;
  // VocabTaskList will handle reloading its own tasks
};

async function handleVocabSaved(vocabId: string) {
  if (!vocabRepo || !taskRepo) {
    console.warn('Repos not available for task update');
    return;
  }
  
  try {
    const taskController = new UpdateVocabTasksController(vocabRepo, taskRepo);
    await taskController.updateTasksForVocab(vocabId);
    // VocabTaskList will handle reloading its own tasks
  } catch (error) {
    console.error('Failed to update vocab tasks:', error);
  }
}
</script>