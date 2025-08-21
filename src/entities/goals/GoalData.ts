export interface GoalData {
  uid: string;
  language: string;
  title: string;
  doNotPractice?: boolean;
  subGoals: string[]; // array of uids of other goals
  tasks: string[]; // uids of TaskData
  vocab: string[]; // uids of Vocab
  factCards: string[]; // uids of FactCardData
  notes: string[]; // uids of NoteData

  prio?: number;

  lastShownAt?: Date;

  origins: string[] // uid of set, or the string "user-added"

}