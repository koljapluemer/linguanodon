<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { Search, Plus, Edit } from "lucide-vue-next";
import type { LearningGoalData } from "@/entities/learning-goals";
import { learningGoalService } from "@/entities/learning-goals";

const router = useRouter();

const goals = ref<LearningGoalData[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 50;

/**
 * Loads all learning goals from the service.
 */
async function loadData() {
  loading.value = true;
  error.value = null;
  try {
    const data = await learningGoalService.getAll();
    goals.value = data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load data";
  } finally {
    loading.value = false;
  }
}

/**
 * Navigate to create new learning goal page.
 */
function createNewGoal() {
  router.push({ name: 'manage-learning-goal' });
}

/**
 * Navigate to edit learning goal page.
 */
function editGoal(uid: string) {
  router.push({ name: 'edit-learning-goal', params: { uid } });
}

const filteredGoals = computed(() => {
  if (!searchQuery.value) return goals.value;
  const query = searchQuery.value.toLowerCase();
  return goals.value.filter((goal: LearningGoalData) => 
    goal.title.toLowerCase().includes(query) ||
    goal.language.toLowerCase().includes(query)
  );
});

const sortedGoals = computed(() => {
  return [...filteredGoals.value].sort((a: LearningGoalData, b: LearningGoalData) => a.title.localeCompare(b.title));
});

const paginatedGoals = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedGoals.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(sortedGoals.value.length / itemsPerPage);
});

onMounted(loadData);
</script>

<template>
  <div class="max-w-6xl mx-auto mt-8 p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Learning Goals</h1>
      <button @click="createNewGoal" class="btn btn-primary btn-sm">
        <Plus class="w-4 h-4" />
        Add Learning Goal
      </button>
    </div>
    <div class="mb-6">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search learning goals by title or language..."
          class="input input-bordered w-full pl-10"
        />
      </div>
    </div>
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Loading learning goals...</p>
    </div>
    <div v-else-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>
    <div v-else>
      <div class="mb-4 text-sm text-gray-600">
        Showing {{ paginatedGoals.length }} of {{ sortedGoals.length }} learning goals
      </div>
      <div class="space-y-4">
        <div 
          v-for="goal in paginatedGoals" 
          :key="goal.uid"
          class="card bg-base-100 shadow-lg"
        >
          <div class="card-body">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="text-lg font-semibold">{{ goal.title }}</h3>
                  <button 
                    @click="editGoal(goal.uid)"
                    class="btn btn-ghost btn-xs"
                    title="Edit learning goal"
                  >
                    <Edit class="w-3 h-3" />
                  </button>
                </div>
                <p class="text-sm text-gray-600 mb-2">{{ goal.language }}</p>
                <div class="text-xs text-gray-500">
                  {{ goal.associatedUnits.length }} associated units, {{ goal.milestones.length }} milestones
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="totalPages > 1" class="flex justify-center mt-8">
        <div class="join">
          <button 
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="join-item btn btn-sm"
          >
            «
          </button>
          <button 
            v-for="page in Math.min(5, totalPages)" 
            :key="page"
            @click="currentPage = page"
            :class="{
              'join-item btn btn-sm': true,
              'btn-active': currentPage === page
            }"
          >
            {{ page }}
          </button>
          <button 
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="join-item btn btn-sm"
          >
            »
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 