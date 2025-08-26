<script setup lang="ts">
import { computed, ref, inject, onMounted } from 'vue';
import type { Task } from '@/entities/tasks/Task';
import ManageResourceVocab from '@/widgets/manage-resource-vocab/ManageResourceVocab.vue';
import ManageResourceFactCards from '@/widgets/manage-resource-fact-cards/ManageResourceFactCards.vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import LinkDisplayAsButton from '@/shared/links/LinkDisplayAsButton.vue';
import TaskDecideWhetherToDoAgain from '@/shared/TaskDecideWhetherToDoAgain.vue';

interface Props {
  task: Task;
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
const resourceRepo = inject<ResourceRepoContract>('resourceRepo')!;
const resource = ref<ResourceData | null>(null);

// Active tab state
const activeTab = ref<'vocab' | 'facts'>('vocab');
const hasChanges = ref(false);
const showDoneSection = ref(false);

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
  
  try {
    // Update lastShownAt
    const updatedResource = {
      ...resource.value,
      lastShownAt: new Date()
    };
    await resourceRepo.updateResource(JSON.parse(JSON.stringify(updatedResource)));
    
    emit('finished');
  } catch (error) {
    console.error('Error skipping resource:', error);
    emit('finished');
  }
};

const handleSkipAndDisable = async () => {
  if (!resource.value) return;
  
  try {
    // Set finishedExtracting to true
    const updatedResource = {
      ...resource.value,
      finishedExtracting: true,
      lastShownAt: new Date()
    };
    await resourceRepo.updateResource(JSON.parse(JSON.stringify(updatedResource)));
    
    emit('finished');
  } catch (error) {
    console.error('Error disabling resource:', error);
    emit('finished');
  }
};

const handleDone = () => {
  showDoneSection.value = true;
};

const handleFinishDecision = async (wantToDoAgain: boolean) => {
  if (!resource.value) return;
  
  try {
    const updatedResource = {
      ...resource.value,
      finishedExtracting: !wantToDoAgain,
      lastShownAt: new Date()
    };
    await resourceRepo.updateResource(JSON.parse(JSON.stringify(updatedResource)));
    
    emit('finished');
  } catch (error) {
    console.error('Error finishing resource:', error);
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

    <div class="tabs tabs-boxed mb-4">
      <button 
        class="tab"
        :class="{ 'tab-active': activeTab === 'vocab' }"
        @click="activeTab = 'vocab'"
      >
        Vocabulary
      </button>
      <button 
        class="tab"
        :class="{ 'tab-active': activeTab === 'facts' }"
        @click="activeTab = 'facts'"
      >
        Fact Cards
      </button>
    </div>

    <div v-if="activeTab === 'vocab'" class="mb-6">
      <ManageResourceVocab
        v-if="resource"
        :resource="resource"
        @resource-updated="handleResourceUpdate"
      />
    </div>

    <div v-if="activeTab === 'facts'" class="mb-6">
      <ManageResourceFactCards
        v-if="resource"
        :resource="resource"
        @resource-updated="handleResourceUpdate"
      />
    </div>

    <div v-if="!showDoneSection" class="flex gap-2">
      <button @click="handleSkip" class="btn btn-outline">Skip</button>
      <button @click="handleSkipAndDisable" class="btn btn-outline">Skip & Disable</button>
      <button @click="handleDone" :disabled="!hasChanges" class="btn btn-primary">Done</button>
    </div>

    <div v-if="showDoneSection">
      <TaskDecideWhetherToDoAgain 
        question="Do you want to extract more knowledge from this resource in the future?"
        @decision="handleFinishDecision" 
      />
    </div>
  </div>
  
  <div v-else>
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>