import type { LearningGoalData } from "@/entities/LearningGoalData";

export interface LearningGoal extends LearningGoalData {
    lastDownloadedAt?: Date
    lastPracticedAt?: Date
}