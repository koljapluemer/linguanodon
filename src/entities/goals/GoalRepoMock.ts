import type { GoalRepoContract } from './GoalRepoContract';
import type { GoalData } from './GoalData';

export class GoalRepoMock implements GoalRepoContract {
  
  private createSampleGoal(overrides: Partial<GoalData> = {}): GoalData {
    return {
      uid: crypto.randomUUID(),
      language: 'en',
      title: 'Sample Goal',
      doNotPractice: false,
      subGoals: [],
      vocab: [],
      factCards: [],
      notes: [],
      prio: 1,
      origins: ['user-added'],
      finishedAddingSubGoals: false,
      finishedAddingMilestones: false,
      finishedAddingKnowledge: false,
      milestones: {},
      isAchieved: false,
      ...overrides
    };
  }

  async getAll(): Promise<GoalData[]> {
    console.info('GoalRepoMock: getAll() - returning 4 sample goals');
    return [
      this.createSampleGoal({
        title: 'Learn French Basics',
        language: 'fr',
        vocab: ['vocab-1', 'vocab-2'],
        subGoals: ['sub-goal-1', 'sub-goal-2']
      }),
      this.createSampleGoal({
        title: 'Master English Grammar',
        language: 'en',
        factCards: ['fact-1', 'fact-2'],
        finishedAddingKnowledge: true
      }),
      this.createSampleGoal({
        title: 'Read Spanish Literature',
        language: 'es',
        isAchieved: true,
        finishedAddingSubGoals: true,
        finishedAddingMilestones: true,
        finishedAddingKnowledge: true
      }),
      this.createSampleGoal({
        title: 'German Conversation',
        language: 'de',
        vocab: ['vocab-3', 'vocab-4', 'vocab-5']
      })
    ];
  }

  async getById(id: string): Promise<GoalData | undefined> {
    console.info(`GoalRepoMock: getById(${id}) - returning sample goal`);
    return this.createSampleGoal({
      uid: id,
      title: `Goal ${id.slice(0, 8)}`,
      vocab: ['vocab-1', 'vocab-2'],
      factCards: ['fact-1']
    });
  }

  async create(goal: Omit<GoalData, 'uid' | 'tasks'>): Promise<GoalData> {
    console.info(`GoalRepoMock: create("${goal.title}") - would create new goal`);
    return this.createSampleGoal({
      ...goal,
      uid: crypto.randomUUID()
    });
  }

  async update(id: string, updates: Omit<Partial<GoalData>, 'uid' | 'tasks'>): Promise<GoalData> {
    console.info(`GoalRepoMock: update(${id}, ${Object.keys(updates).join(', ')}) - would update goal`);
    return this.createSampleGoal({
      uid: id,
      title: `Updated Goal ${id.slice(0, 8)}`,
      ...updates
    });
  }

  async delete(id: string): Promise<void> {
    console.info(`GoalRepoMock: delete(${id}) - would delete goal`);
  }

  async getIncompleteGoals(): Promise<GoalData[]> {
    console.info('GoalRepoMock: getIncompleteGoals() - returning 2 incomplete goals');
    return [
      this.createSampleGoal({
        title: 'Incomplete Goal 1',
        language: 'en',
        vocab: ['vocab-1'],
        isAchieved: false,
        finishedAddingKnowledge: false
      }),
      this.createSampleGoal({
        title: 'Incomplete Goal 2',
        language: 'fr',
        factCards: ['fact-1'],
        isAchieved: false,
        finishedAddingSubGoals: false
      })
    ];
  }

  async getGoalsNeedingVocab(languages: string[]): Promise<GoalData[]> {
    console.info(`GoalRepoMock: getGoalsNeedingVocab([${languages.join(', ')}]) - returning goals needing vocab`);
    return [
      this.createSampleGoal({
        title: 'Goal Needing Vocab',
        language: languages[0] || 'en',
        vocab: ['existing-vocab-1'],
        isAchieved: false,
        finishedAddingKnowledge: false
      })
    ];
  }

  async getGoalsNeedingSubGoals(languages: string[]): Promise<GoalData[]> {
    console.info(`GoalRepoMock: getGoalsNeedingSubGoals([${languages.join(', ')}]) - returning goals needing sub-goals`);
    return [
      this.createSampleGoal({
        title: 'Goal Needing Sub-Goals',
        language: languages[0] || 'en',
        subGoals: ['existing-subgoal-1'],
        isAchieved: false,
        finishedAddingSubGoals: false
      })
    ];
  }

  async getSubGoals(parentId: string): Promise<GoalData[]> {
    console.info(`GoalRepoMock: getSubGoals(${parentId}) - returning 2 sub-goals`);
    return [
      this.createSampleGoal({
        title: `Sub-goal 1 of ${parentId.slice(0, 8)}`,
        language: 'en',
        vocab: ['vocab-1']
      }),
      this.createSampleGoal({
        title: `Sub-goal 2 of ${parentId.slice(0, 8)}`,
        language: 'en',
        factCards: ['fact-1']
      })
    ];
  }

  async getRootGoals(): Promise<GoalData[]> {
    console.info('GoalRepoMock: getRootGoals() - returning 2 root goals');
    return [
      this.createSampleGoal({
        title: 'Root Goal: Language Mastery',
        language: 'en',
        subGoals: ['sub-1', 'sub-2', 'sub-3'],
        vocab: ['vocab-1', 'vocab-2']
      }),
      this.createSampleGoal({
        title: 'Root Goal: Cultural Understanding',
        language: 'fr',
        subGoals: ['sub-4', 'sub-5'],
        factCards: ['fact-1', 'fact-2']
      })
    ];
  }

  async getParentGoal(goalId: string): Promise<GoalData | undefined> {
    console.info(`GoalRepoMock: getParentGoal(${goalId}) - returning parent goal`);
    return this.createSampleGoal({
      title: `Parent of ${goalId.slice(0, 8)}`,
      language: 'en',
      subGoals: [goalId, 'other-sub-goal'],
      vocab: ['vocab-1', 'vocab-2', 'vocab-3']
    });
  }
}