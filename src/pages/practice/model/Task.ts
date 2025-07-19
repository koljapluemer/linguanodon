/**
 * Represents a UI task that users interact with.
 * Tasks are created from exercises and handle the user interface logic.
 */
export interface Task {
  /** Unique identifier for this task */
  id: string;
  
  /** Type of task (e.g., 'flashcard', 'free-translation', 'choose-from-two') */
  taskType: string;
  
  /** Task-specific data for UI rendering */
  data: Record<string, unknown>;
  
  /** Whether this task can be skipped */
  canSkip: boolean;
  
  /** User's input (for input-based tasks) */
  userInput?: string;
  
  /** User's rating after completion */
  userRating?: 'Impossible' | 'Hard' | 'Doable' | 'Easy';
} 