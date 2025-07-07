import { defineStore } from "pinia";
import { ref } from "vue";
import type { Task } from "@/entities/Task";

export const useTaskStore = defineStore(
  "task",
  () => {
    const tasks = ref<Task[]>([]);

    /**
     * Creates a new task
     */
    function createTask(task: Omit<Task, "uid">) {
      const newTask: Task = {
        ...task,
        uid: crypto.randomUUID(),
      };
      tasks.value.push(newTask);
      return newTask;
    }

    /**
     * Creates a task with a specific UID (for remote data)
     */
    function createTaskWithUID(task: Task) {
      // Check if task already exists
      const existing = tasks.value.find((t) => t.uid === task.uid);
      if (existing) {
        return existing;
      }
      tasks.value.push(task);
      return task;
    }

    /**
     * Updates an existing task
     */
    function updateTask(uid: string, updates: Partial<Task>) {
      const index = tasks.value.findIndex((task) => task.uid === uid);
      if (index === -1) {
        throw new Error("Task not found");
      }

      tasks.value[index] = {
        ...tasks.value[index],
        ...updates,
      };
      return tasks.value[index];
    }

    /**
     * Deletes a task by UID
     */
    function deleteTask(uid: string) {
      const index = tasks.value.findIndex((task) => task.uid === uid);
      if (index === -1) {
        throw new Error("Task not found");
      }

      tasks.value.splice(index, 1);
    }

    /**
     * Gets a task by UID
     */
    function getTask(uid: string): Task | undefined {
      return tasks.value.find((task) => task.uid === uid);
    }

    /**
     * Gets all tasks
     */
    function getAllTasks(): Task[] {
      return tasks.value;
    }

    /**
     * Gets tasks by completion status
     */
    function getTasksByCompletionStatus(isCompleted: boolean): Task[] {
      return tasks.value.filter((task) => task.isCompleted === isCompleted);
    }

    /**
     * Gets tasks ready to show (nextShownEarliestAt is in the past or undefined)
     */
    function getTasksReadyToShow(): Task[] {
      const now = new Date();
      return tasks.value.filter((task) => {
        if (task.isCompleted) return false;
        if (!task.nextShownEarliestAt) return true;
        return task.nextShownEarliestAt <= now;
      });
    }

    /**
     * Gets tasks by interval
     */
    function getTasksByInterval(interval: number): Task[] {
      return tasks.value.filter((task) => task.interval === interval);
    }

    /**
     * Adds a task attempt
     */
    function addTaskAttempt(taskUid: string, attempt: Omit<Task["attempts"][0], "timestamp">) {
      const task = getTask(taskUid);
      if (!task) {
        throw new Error("Task not found");
      }

      const newAttempt = {
        ...attempt,
        timestamp: new Date(),
      };

      task.attempts.push(newAttempt);
      return newAttempt;
    }

    /**
     * Marks a task as completed
     */
    function completeTask(uid: string) {
      return updateTask(uid, { isCompleted: true });
    }

    /**
     * Sets the next show time for a task
     */
    function setNextShowTime(uid: string, nextShownEarliestAt: Date) {
      return updateTask(uid, { nextShownEarliestAt });
    }

    /**
     * Updates task interval
     */
    function updateTaskInterval(uid: string, interval: number) {
      return updateTask(uid, { interval });
    }

    /**
     * Initializes the store with demo data
     */
    function initializeWithDemoData() {
      if (tasks.value.length > 0) {
        return; // Don't overwrite existing data
      }

      const demoTasks: Task[] = [
        {
          uid: "demo-task-1",
          title: "Practice Spanish Greetings",
          description: "Review and practice basic Spanish greeting phrases",
          unitsOfMeaning: [],
          isCompleted: false,
          interval: 1,
          attempts: [],
          lastDownloadedAt: new Date(),
          lastPracticedAt: undefined,
          nextShownEarliestAt: undefined
        },
        {
          uid: "demo-task-2", 
          title: "Learn French Numbers 1-10",
          description: "Memorize the French words for numbers one through ten",
          unitsOfMeaning: [],
          isCompleted: false,
          interval: 2,
          attempts: [],
          lastDownloadedAt: new Date(),
          lastPracticedAt: undefined,
          nextShownEarliestAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
        }
      ];

      tasks.value.push(...demoTasks);
    }

    return {
      // State
      tasks,

      // Actions
      createTask,
      createTaskWithUID,
      updateTask,
      deleteTask,
      getTask,
      getAllTasks,
      getTasksByCompletionStatus,
      getTasksReadyToShow,
      getTasksByInterval,
      addTaskAttempt,
      completeTask,
      setNextShowTime,
      updateTaskInterval,
      initializeWithDemoData,
    };
  },
  {
    persist: {
      key: "tasks",
      storage: localStorage,
    },
  }
);
