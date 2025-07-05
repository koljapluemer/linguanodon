<template>
  <div>
    <div v-if="loading" class="flex justify-center items-center p-8">
      <span class="loading loading-spinner loading-lg"></span>
      <span class="ml-2">Generating lesson...</span>
    </div>

    <div v-else-if="error" class="alert alert-error">
      <AlertCircle class="w-5 h-5" />
      <span>{{ error }}</span>
    </div>

    <div v-else-if="exercises.length > 0" class="space-y-4">
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">Exercises Generated</div>
          <div class="stat-value">{{ exercises.length }}</div>
        </div>
      </div>
      
      <div class="space-y-2">
        <h3 class="text-lg font-semibold">Generated Exercises:</h3>
        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div 
            v-for="exercise in exercises" 
            :key="exercise.uid"
            class="card bg-base-200 p-4"
          >
            <div class="font-mono text-sm text-base-content/70">{{ exercise.uid }}</div>
            <div class="mt-2">
              <div class="font-medium">Front:</div>
              <div class="p-2 bg-base-100 rounded">{{ exercise.front }}</div>
            </div>
            <div class="mt-2">
              <div class="font-medium">Back:</div>
              <div class="p-2 bg-base-100 rounded whitespace-pre-line">{{ exercise.back }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-info">
      <Info class="w-5 h-5" />
      <span>No exercises could be generated for this learning goal.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { AlertCircle, Info } from "lucide-vue-next";
import { useLearningGoalStore } from "@/stores/learningGoalStore";
import { useUnitOfMeaningStore } from "@/stores/unitOfMeaningStore";
import { useUserSettingsStore } from "@/stores/userSettingsStore";
import { generateLessonForLearningGoal } from "@/utils/generateLessonForLearningGoal";
import type { ExerciseFlashcard } from "@/entities/ExerciseFlashcard";

interface Props {
  learningGoalUid: string;
}

const props = defineProps<Props>();

const learningGoalStore = useLearningGoalStore();
const unitOfMeaningStore = useUnitOfMeaningStore();
const userSettingsStore = useUserSettingsStore();

const loading = ref(true);
const error = ref<string | null>(null);
const exercises = ref<ExerciseFlashcard[]>([]);

onMounted(async () => {
  try {
    // Get the learning goal
    const learningGoal = learningGoalStore.getLearningGoal(props.learningGoalUid);
    if (!learningGoal) {
      throw new Error(`Learning goal with UID "${props.learningGoalUid}" not found`);
    }

    // Get all units of meaning for this learning goal
    const unitsOfMeaning = learningGoal.unitsOfMeaning
      .map(uid => unitOfMeaningStore.getUnitOfMeaning(uid))
      .filter((unit): unit is NonNullable<typeof unit> => unit !== undefined);

    if (unitsOfMeaning.length === 0) {
      throw new Error("No units of meaning found for this learning goal");
    }

    // Get native language from user settings
    const nativeLanguage = userSettingsStore.getPrimaryNativeLanguage();
    if (!nativeLanguage) {
      throw new Error("No primary native language configured in user settings");
    }

    // Generate exercises
    const generatedExercises = generateLessonForLearningGoal(
      learningGoal,
      unitsOfMeaning,
      nativeLanguage,
      unitOfMeaningStore.getUnitOfMeaning
    );

    exercises.value = generatedExercises;
    
    // Log exercises to console as requested
    console.log("Generated exercises:", generatedExercises);
    console.log("Learning goal:", learningGoal);
    console.log("Units of meaning:", unitsOfMeaning);
    console.log("Native language:", nativeLanguage);

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    error.value = errorMessage;
    console.error("Error generating lesson:", err);
  } finally {
    loading.value = false;
  }
});
</script>
