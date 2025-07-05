import { defineStore } from "pinia";
import { ref, readonly } from "vue";
import type { LearningGoal } from "@/entities/LearningGoal";

export const useLearningGoalStore = defineStore(
  "learningGoal",
  () => {
    const learningGoals = ref<LearningGoal[]>([]);

    /**
     * Creates a new learning goal
     */
    function createLearningGoal(goal: Omit<LearningGoal, "uid">) {
      const newGoal: LearningGoal = {
        ...goal,
        uid: crypto.randomUUID(),
      };
      learningGoals.value.push(newGoal);
      return newGoal;
    }

    /**
     * Updates an existing learning goal
     */
    function updateLearningGoal(uid: string, updates: Partial<LearningGoal>) {
      const index = learningGoals.value.findIndex((goal) => goal.uid === uid);
      if (index === -1) {
        throw new Error("Learning goal not found");
      }

      learningGoals.value[index] = {
        ...learningGoals.value[index],
        ...updates,
      };
      return learningGoals.value[index];
    }

    /**
     * Deletes a learning goal by UID
     */
    function deleteLearningGoal(uid: string) {
      const index = learningGoals.value.findIndex((goal) => goal.uid === uid);
      if (index === -1) {
        throw new Error("Learning goal not found");
      }

      learningGoals.value.splice(index, 1);
    }

    /**
     * Gets a learning goal by UID
     */
    function getLearningGoal(uid: string): LearningGoal | undefined {
      return learningGoals.value.find((goal) => goal.uid === uid);
    }

    /**
     * Gets all learning goals
     */
    function getAllLearningGoals(): LearningGoal[] {
      return learningGoals.value;
    }

    /**
     * Gets learning goals by language
     */
    function getLearningGoalsByLanguage(language: string): LearningGoal[] {
      return learningGoals.value.filter((goal) => goal.language === language);
    }

    return {
      // State
      learningGoals: readonly(learningGoals),

      // Actions
      createLearningGoal,
      updateLearningGoal,
      deleteLearningGoal,
      getLearningGoal,
      getAllLearningGoals,
      getLearningGoalsByLanguage,
    };
  },
  {
    persist: {
      key: "learning-goals",
      storage: localStorage,
    },
  }
);
