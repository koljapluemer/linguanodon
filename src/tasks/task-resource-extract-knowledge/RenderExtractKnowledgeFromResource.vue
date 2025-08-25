<script setup lang="ts">
import { computed, ref, inject, onMounted } from 'vue';
import type { TaskData } from '@/entities/tasks/TaskData';
import ManageVocabOfResourceWidget from '@/features/resource-manage-its-vocab/ManageVocabOfResourceWidget.vue';
import ManageFactsOfResourceWidget from '@/features/resource-manage-its-facts/ManageFactsOfResourceWidget.vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import LinkDisplayAsButton from '@/shared/links/LinkDisplayAsButton.vue';

interface Props {
  task: TaskData;
}

interface Emits {
  (e: 'taskNowMayBeConsideredDone'): void;
  (e: 'taskNowMayNotBeConsideredDone'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Get the resource ID from associated resources
const resourceUid = computed(() => {
  return props.task.associatedResources?.[0];
});

// Resource data and loading
const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
const resource = ref<ResourceData | null>(null);

// Active tab state
const activeTab = ref<'vocab' | 'facts'>('vocab');

const loadResource = async () => {
  if (!resourceUid.value || !resourceRepo) return;

  try {
    const resourceData = await resourceRepo.getResourceById(resourceUid.value);
    resource.value = resourceData || null;
  } catch (error) {
    console.error('Failed to load resource:', error);
  }
};

function handleVocabListChanged() {
  emit('taskNowMayBeConsideredDone');
}

function handleFactCardListChanged() {
  emit('taskNowMayBeConsideredDone');
}

onMounted(() => {
  loadResource();
});
</script>

<template>
  <div class="space-y-4">
    <!-- Resource info header -->
    <div v-if="resource" class="bg-base-200 p-4 rounded-lg">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold">{{ resource.title }}</h2>
          <p class="text-sm text-base-content/70">Extract knowledge from this resource</p>
        </div>
        <LinkDisplayAsButton 
          v-if="resource.link" 
          :link="resource.link"
        />
      </div>
    </div>

    <!-- Tab navigation -->
    <div class="tabs tabs-lifted">
      <button 
        class="tab"
        :class="{ 'tab-active': activeTab === 'vocab' }"
        @click="activeTab = 'vocab'"
      >
        Extract Vocabulary
      </button>
      <button 
        class="tab"
        :class="{ 'tab-active': activeTab === 'facts' }"
        @click="activeTab = 'facts'"
      >
        Create Fact Cards
      </button>
    </div>

    <!-- Tab content -->
    <div class="tab-content bg-base-100 border-base-300 rounded-box p-6">
      <div v-if="activeTab === 'vocab'" class="space-y-4">
        <div class="prose">
          <p>Go through the resource and identify important vocabulary words. Add them with translations and context.</p>
        </div>
        <ManageVocabOfResourceWidget
          v-if="resourceUid"
          :resourceUid="resourceUid"
          @vocabListChanged="handleVocabListChanged"
        />
      </div>

      <div v-if="activeTab === 'facts'" class="space-y-4">
        <div class="prose">
          <p>Extract important facts, cultural information, or key concepts from the resource into fact cards.</p>
        </div>
        <ManageFactsOfResourceWidget
          v-if="resourceUid"
          :resourceUid="resourceUid"
          @factCardListChanged="handleFactCardListChanged"
        />
      </div>
    </div>
  </div>
</template>