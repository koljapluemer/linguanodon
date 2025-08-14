export interface TaskData {
  uid: string;
  taskType: string;
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

type AssociatedEntity = 'Vocab' | 'Resource' | 'FactCard' | 'Goal'
interface Association  {
  type: AssociatedEntity
  uid: string
}