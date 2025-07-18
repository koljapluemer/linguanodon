
// Represents a lesson, which is a sequence of exercises for the user to complete.
// The ExerciseType parameter allows plugging in any exercise shape.
export interface LessonData<ExerciseType = unknown> {
  id: string;
  exercises: ExerciseType[];
  // Optionally, track current progress in the lesson
  currentIndex?: number;
} 