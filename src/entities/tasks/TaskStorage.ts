import Dexie, { type Table } from 'dexie';
import type { TaskData } from './TaskData';

class TaskDatabase extends Dexie {
  tasks!: Table<TaskData>;

  constructor() {
    super('TaskDatabase');
    this.version(1).stores({
      tasks: 'uid, taskType, isActive, lastShownAt'
    });
  }
}

const db = new TaskDatabase();

export class TaskStorage {
  async getAll(): Promise<TaskData[]> {
    const tasks = await db.tasks.toArray();
    console.log('TaskStorage: Retrieved', tasks.length, 'tasks');
    return tasks;
  }

  async getByUID(uid: string): Promise<TaskData | undefined> {
    return await db.tasks.get(uid);
  }

  async add(task: TaskData): Promise<void> {
    console.log('TaskStorage: Adding task to DB:', task.title);
    try {
      await db.tasks.add(task);
      console.log('TaskStorage: Successfully added task to DB:', task.title);
    } catch (error) {
      console.error('TaskStorage: Failed to add task to DB:', error);
      throw error;
    }
  }

  async update(task: TaskData): Promise<void> {
    await db.tasks.put(task);
  }

  async delete(uid: string): Promise<void> {
    await db.tasks.delete(uid);
  }

  async count(): Promise<number> {
    return await db.tasks.count();
  }

  async getByTaskType(taskType: string): Promise<TaskData[]> {
    return await db.tasks.where('taskType').equals(taskType).toArray();
  }

  async getActive(): Promise<TaskData[]> {
    return await db.tasks.where('isActive').equals(1).toArray();
  }

  async getRecentTasks(limit: number): Promise<TaskData[]> {
    return await db.tasks
      .where('lastShownAt')
      .above(new Date(0))
      .reverse()
      .sortBy('lastShownAt')
      .then(tasks => tasks.slice(0, limit));
  }

  async getTasksWithAssociatedResource(resourceUid: string): Promise<TaskData[]> {
    const allTasks = await db.tasks.toArray();
    return allTasks.filter(task => 
      task.associatedUnits.some(unit => unit.type === 'Resource' && unit.uid === resourceUid)
    );
  }

  async getTasksWithAssociatedVocab(vocabUid: string): Promise<TaskData[]> {
    const allTasks = await db.tasks.toArray();
    return allTasks.filter(task => 
      task.associatedUnits.some(unit => unit.type === 'Vocab' && unit.uid === vocabUid)
    );
  }
}