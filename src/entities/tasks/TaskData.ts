export interface TaskData {
  uid: string;
  taskType: TaskType;
  title: string;
  prompt: string;
  evaluateCorrectnessAndConfidenceAfterDoing: boolean;
  decideWhetherToDoAgainAfterDoing: boolean;
  isActive: boolean;
  taskSize: 'big' | 'medium' | 'small';
  lastShownAt?: Date;
  nextShownEarliestAt?: Date;
  lastDifficultyRating?: number;
  lastCorrectnessRating?: number;
  associatedUnits: Association[]; // used to persist references to vocab, resources, fact cards, goals etc. used for this task
} 

export type TaskType = 
  | 'add-pronunciation' 
  | 'free-translate'
  | 'add-sub-goals'
  | 'add-vocab-to-goal'
  | 'add-milestones'
  | 'complete-goal'
  | 'milestone'
  | 'add-vocab-to-resource'
  | 'add-fact-cards-to-resource'
  | 'vocab-try-to-remember'
  | 'vocab-reveal'
  | 'vocab-choose-from-options'

type AssociatedEntity = 'Vocab' | 'Resource' | 'FactCard' | 'Goal'
interface Association  {
  type: AssociatedEntity
  uid: string
}