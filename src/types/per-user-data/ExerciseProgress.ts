export interface ExerciseProgress {
    uid: string; // PK, matches the exercise or unit this progress is for
    lastPracticedAt: Date
}
