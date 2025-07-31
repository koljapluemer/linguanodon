import Dexie, { type Table } from 'dexie';
import type { GoalData } from './GoalData';

export class GoalStorage extends Dexie {
  goals!: Table<GoalData>;

  constructor() {
    super('GoalStorage');
    
    this.version(1).stores({
      goals: 'uid, taskType, title, wantToDoAgain, parentGoal, *subGoals, *vocab, *examples, *factCards, *notes'
    });
  }
}

export const goalStorage = new GoalStorage();