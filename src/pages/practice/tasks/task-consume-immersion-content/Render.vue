<script setup lang="ts">
import { computed, ref, onMounted, toRaw } from 'vue';
import type { Task } from '@/pages/practice/Task';
import ManageResourceVocab from '@/widgets/manage-resource-vocab/ManageResourceVocab.vue';
import ManageResourceFactCards from '@/widgets/manage-resource-fact-cards/ManageResourceFactCards.vue';
import type { ResourceData } from '@/entities/resources/ResourceData';
import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import LinkDisplayAsButton from '@/shared/links/LinkDisplayAsButton.vue';
import TaskSkipDisableDone from '@/pages/practice/tasks/ui/TaskSkipDisableDone.vue';
import type { NoteData } from '@/entities/notes/NoteData';

interface Props {
  task: Task;
  repositories: RepositoriesContext;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  finished: [];
}>();

// Get the resource ID from associated resources
const resourceUid = computed(() => {
  return props.task.associatedResources?.[0];
});

// Resource data and loading
const resourceRepo = props.repositories.resourceRepo!;
const noteRepo = props.repositories.noteRepo!;
const resource = ref<ResourceData | null>(null);

// UI state
const experienceComment = ref('');
const showManagementWidgets = ref<'vocab' | 'facts' | false>(false);
const hasChanges = ref(false);

const loadResource = async () => {
  if (!resourceUid.value) return;

  try {
    const resourceData = await resourceRepo.getResourceById(resourceUid.value);
    resource.value = resourceData || null;
  } catch (error) {
    console.error('Failed to load resource:', error);
  }
};

function handleResourceUpdate(updatedResource: ResourceData) {
  resource.value = updatedResource;
  hasChanges.value = true;
}

const handleSkip = async () => {
  if (!resource.value) return;
  
  // Update lastShownAt when skipping
  const updatedResource: ResourceData = {
    ...toRaw(resource.value),
    lastShownAt: new Date()
  };
  
  try {
    await resourceRepo.updateResource(updatedResource);
    emit('finished');
  } catch (error) {
    console.error('Failed to update resource lastShownAt:', error);
    emit('finished');
  }
};

const handleDone = async () => {
  if (!resource.value) return;

  try {
    // Save the experience comment as a note if provided
    if (experienceComment.value.trim()) {
      const noteData: Omit<NoteData, 'uid'> = {
        content: experienceComment.value.trim(),
        noteType: 'immersion-experience'
      };
      
      const note = await noteRepo.saveNote(noteData);
      
      // Add the note to the resource
      const updatedResource: ResourceData = {
        ...toRaw(resource.value),
        notes: [...resource.value.notes, note.uid],
        lastShownAt: new Date()
      };
      
      await resourceRepo.updateResource(updatedResource);
    } else {
      // Just update lastShownAt
      const updatedResource: ResourceData = {
        ...toRaw(resource.value),
        lastShownAt: new Date()
      };
      
      await resourceRepo.updateResource(updatedResource);
    }
    
    emit('finished');
  } catch (error) {
    console.error('Failed to save experience comment or update resource:', error);
    emit('finished');
  }
};

onMounted(() => {
  loadResource();
});
</script>

<template>
  <div v-if="resource">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">{{ resource.title }}</h2>
      <LinkDisplayAsButton v-if="resource.link" :link="resource.link" />
    </div>

    <div class="mb-6">
      <p class="text-lg mb-4">{{ task.prompt }}</p>
      
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text">How was your experience? (optional)</span>
        </label>
        <textarea 
          v-model="experienceComment"
          class="textarea textarea-bordered h-24" 
          placeholder="Comment on your understanding, what you learned, difficulties, etc..."
        ></textarea>
      </div>
    </div>

    <details class="collapse collapse-arrow border border-base-300 mb-6">
      <summary class="collapse-title text-lg font-medium">
        Manage vocabulary and fact cards for this resource
      </summary>
      <div class="collapse-content">
        <div class="tabs tabs-boxed mb-4">
          <button 
            class="tab"
            :class="{ 'tab-active': !showManagementWidgets || showManagementWidgets === 'vocab' }"
            @click="showManagementWidgets = 'vocab'"
          >
            Vocabulary
          </button>
          <button 
            class="tab"
            :class="{ 'tab-active': showManagementWidgets === 'facts' }"
            @click="showManagementWidgets = 'facts'"
          >
            Fact Cards
          </button>
        </div>

        <div v-if="!showManagementWidgets || showManagementWidgets === 'vocab'" class="mb-6">
          <ManageResourceVocab
            v-if="resource"
            :resource="resource"
            @resource-updated="handleResourceUpdate"
          />
        </div>

        <div v-if="showManagementWidgets === 'facts'" class="mb-6">
          <ManageResourceFactCards
            v-if="resource"
            :resource="resource"
            @resource-updated="handleResourceUpdate"
          />
        </div>
      </div>
    </details>

    <TaskSkipDisableDone 
      :done-disabled="false"
      @skip="handleSkip"
      @done="handleDone"
    />
  </div>
  
  <div v-else>
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>
