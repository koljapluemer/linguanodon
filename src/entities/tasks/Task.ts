
export interface Task {
  uid: string;
  language: string; // code of LanguageData
  taskType: TaskName;
  prompt: string;

  associatedVocab?: string[] // uids of vocab data
  associatedResources?: string[] // uids of resourcee data
  associatedFactCards?: string[] // uids of fact card data
  associatedGoals?: string[] // uids of goal data
} 

export type TaskName = |
  'add-pronunciation' |
  'add-translation' |
  'extract-knowledge-from-resource' |
  'add-sub-goals' |
  'add-vocab-to-goal' |
  'vocab-try-to-remember' |
  'vocab-reveal-target-to-native' |
  'vocab-reveal-native-to-target' |
  'vocab-choose-from-two-target-to-native' |
  'vocab-choose-from-two-native-to-target' |
  'vocab-choose-from-four-target-to-native' | 
  'vocab-choose-from-four-native-to-target' 

