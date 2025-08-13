export interface GoalData {
  uid: string;
  title: string;
  doNotPractice?: boolean;
  subGoals: string[]; // array of uids of other goals
  parentGoal?: string; // uid of parent goal (each goal has only one parent)
  tasks: string[]; // uids of TaskData
  vocab: string[]; // uids of Vocab
  factCards: string[];
  notes: string[];

  prio?: number;
}