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
        <!-- Core Content - Big Type -->
        <div class="space-y-6">
          <h2 class="text-lg font-semibold">Core Content</h2>
          
          <FormField label="Content" size="lg" required>
            <template #default="{ inputId, inputClasses }">
              <input
                :id="inputId"
                v-model="state.formData.content"
                type="text"
                placeholder="The word or phrase"
                :class="inputClasses"
                required
              />
            </template>
          </FormField>

          <!-- Translations -->
          <div class="mt-6">
            <TranslationGroupForm
              v-model="state.formData.translations"
              :allow-edit-on-click="true"
              :show-delete-button="true"
              :allow-adding-new="true"
            />
          </div>
        </div>

        <!-- Basic Information -->
        <div class="space-y-6">
          <h2 class="text-lg font-semibold">Basic Information</h2>
          
          <FormField label="Language" required>
            <template #default="{ inputId }">
              <LanguageDropdown
                :id="inputId"
                v-model="state.formData.language"
                placeholder="Select target language"
                required
              />
            </template>
          </FormField>

          <FormField label="Priority">
            <template #default="{ inputId, inputClasses }">
              <input
                :id="inputId"
                v-model.number="state.formData.priority"
                type="number"
                min="1"
                max="5"
                placeholder="1"
                :class="inputClasses"
                style="width: 6rem"
              />
            </template>
          </FormField>

          <FormField label="">
            <template #default="{ inputId }">
              <label :for="inputId" class="cursor-pointer label justify-start gap-2">
                <input
                  :id="inputId"
                  v-model="state.formData.doNotPractice"
                  type="checkbox"
                  class="checkbox"
                />
                <span class="label-text">Exclude from practice</span>
              </label>
            </template>
          </FormField>
        </div>

        <!-- Notes -->
        <div class="space-y-6">
          <h2 class="text-lg font-semibold">Notes</h2>
          
          <NoteList
            :notes="state.formData.notes"
            :show-before-exercise-option="true"
            @add="addNote"
            @update="updateNote"
            @delete="removeNote"
          />
        </div>

        <!-- Links -->
        <div class="space-y-6">
          <div class="flex justify-between items-center">
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
              class="border rounded-lg p-4"
            >
              <div class="flex justify-between items-start gap-4">
                <div class="flex-1 space-y-4">
                  <FormField label="Link label" size="sm">
                    <template #default="{ inputId, inputClasses }">
                      <input
                        :id="inputId"
                        v-model="link.label"
                        type="text"
                        placeholder="Link label"
                        :class="inputClasses"
                      />
                    </template>
                  </FormField>
                  
                  <FormField label="URL" size="sm">
                    <template #default="{ inputId, inputClasses }">
                      <input
                        :id="inputId"
                        v-model="link.url"
                        type="url"
                        placeholder="https://..."
                        :class="inputClasses"
                      />
                    </template>
                  </FormField>
                </div>
                
                <button
                  type="button"
                  @click="removeLink(index)"
                  class="btn btn-sm btn-ghost btn-circle text-error"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between items-center">
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
import NoteList from '@/entities/notes/NoteList.vue';
import LanguageDropdown from '@/shared/ui/LanguageDropdown.vue';
import TranslationGroupForm from '@/entities/vocab/translations/TranslationGroupForm.vue';
import FormField from '@/shared/ui/FormField.vue';
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