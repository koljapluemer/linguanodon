
// Represents a UI task to be rendered, based on an Exercise. For MVP, this is a thin wrapper.
// The ExerciseType parameter allows plugging in any exercise shape.
export interface TaskData<ExerciseType = unknown> {
  exercise: ExerciseType;
} 