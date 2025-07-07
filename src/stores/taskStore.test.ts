import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTaskStore } from './taskStore'
import type { Task } from '@/entities/Task'

describe('taskStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockTask: Omit<Task, 'uid'> = {
    title: 'Test Task',
    description: 'A test task for unit testing',
    unitsOfMeaning: [],
    isCompleted: false,
    interval: 1,
    attempts: [],
    lastDownloadedAt: new Date(),
    lastPracticedAt: undefined,
    nextShownEarliestAt: undefined
  }

  describe('CRUD operations', () => {
    it('should create a new task', () => {
      const store = useTaskStore()
      const task = store.createTask(mockTask)

      expect(task.uid).toBeDefined()
      expect(task.title).toBe('Test Task')
      expect(store.getAllTasks()).toHaveLength(1)
    })

    it('should create a task with specific UID', () => {
      const store = useTaskStore()
      const taskWithUid: Task = {
        ...mockTask,
        uid: 'specific-uid'
      }

      const task = store.createTaskWithUID(taskWithUid)
      expect(task.uid).toBe('specific-uid')
      expect(store.getAllTasks()).toHaveLength(1)
    })

    it('should not create duplicate tasks with same UID', () => {
      const store = useTaskStore()
      const taskWithUid: Task = {
        ...mockTask,
        uid: 'duplicate-uid'
      }

      const task1 = store.createTaskWithUID(taskWithUid)
      const task2 = store.createTaskWithUID(taskWithUid)

      expect(task1).toStrictEqual(task2)
      expect(store.getAllTasks()).toHaveLength(1)
    })

    it('should update an existing task', () => {
      const store = useTaskStore()
      const task = store.createTask(mockTask)
      
      const updatedTask = store.updateTask(task.uid, { title: 'Updated Task' })
      expect(updatedTask.title).toBe('Updated Task')
      expect(store.getTask(task.uid)?.title).toBe('Updated Task')
    })

    it('should throw error when updating non-existent task', () => {
      const store = useTaskStore()
      expect(() => {
        store.updateTask('non-existent', { title: 'Updated' })
      }).toThrow('Task not found')
    })

    it('should delete a task', () => {
      const store = useTaskStore()
      const task = store.createTask(mockTask)
      
      store.deleteTask(task.uid)
      expect(store.getAllTasks()).toHaveLength(0)
      expect(store.getTask(task.uid)).toBeUndefined()
    })

    it('should throw error when deleting non-existent task', () => {
      const store = useTaskStore()
      expect(() => {
        store.deleteTask('non-existent')
      }).toThrow('Task not found')
    })

    it('should get task by UID', () => {
      const store = useTaskStore()
      const task = store.createTask(mockTask)
      
      const foundTask = store.getTask(task.uid)
      expect(foundTask).toEqual(task)
    })
  })

  describe('convenience methods', () => {
    it('should get tasks by completion status', () => {
      const store = useTaskStore()
      const completedTask: Omit<Task, 'uid'> = { ...mockTask, isCompleted: true }
      
      store.createTask(mockTask)
      store.createTask(completedTask)

      expect(store.getTasksByCompletionStatus(false)).toHaveLength(1)
      expect(store.getTasksByCompletionStatus(true)).toHaveLength(1)
    })

    it('should get tasks ready to show', () => {
      const store = useTaskStore()
      const futureTask: Omit<Task, 'uid'> = {
        ...mockTask,
        nextShownEarliestAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      }
      const completedTask: Omit<Task, 'uid'> = { ...mockTask, isCompleted: true }
      
      store.createTask(mockTask) // Ready to show (no nextShownEarliestAt)
      store.createTask(futureTask) // Not ready (future date)
      store.createTask(completedTask) // Not ready (completed)

      const readyTasks = store.getTasksReadyToShow()
      expect(readyTasks).toHaveLength(1)
      expect(readyTasks[0].title).toBe('Test Task')
    })

    it('should get tasks by interval', () => {
      const store = useTaskStore()
      const task2: Omit<Task, 'uid'> = { ...mockTask, interval: 2 }
      
      store.createTask(mockTask) // interval: 1
      store.createTask(task2) // interval: 2

      expect(store.getTasksByInterval(1)).toHaveLength(1)
      expect(store.getTasksByInterval(2)).toHaveLength(1)
    })

    it('should add task attempt', () => {
      const store = useTaskStore()
      const task = store.createTask(mockTask)
      
      const attempt = store.addTaskAttempt(task.uid, {
        ease: 3,
        correctness: 1
      })

      expect(attempt.ease).toBe(3)
      expect(attempt.correctness).toBe(1)
      expect(attempt.timestamp).toBeInstanceOf(Date)
      expect(store.getTask(task.uid)?.attempts).toHaveLength(1)
    })

    it('should complete a task', () => {
      const store = useTaskStore()
      const task = store.createTask(mockTask)
      
      const completedTask = store.completeTask(task.uid)
      expect(completedTask.isCompleted).toBe(true)
      expect(store.getTask(task.uid)?.isCompleted).toBe(true)
    })

    it('should set next show time', () => {
      const store = useTaskStore()
      const task = store.createTask(mockTask)
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
      
      const updatedTask = store.setNextShowTime(task.uid, futureDate)
      expect(updatedTask.nextShownEarliestAt).toEqual(futureDate)
    })

    it('should update task interval', () => {
      const store = useTaskStore()
      const task = store.createTask(mockTask)
      
      const updatedTask = store.updateTaskInterval(task.uid, 5)
      expect(updatedTask.interval).toBe(5)
      expect(store.getTask(task.uid)?.interval).toBe(5)
    })
  })

  describe('demo data', () => {
    it('should initialize with demo data when store is empty', () => {
      const store = useTaskStore()
      store.initializeWithDemoData()
      
      const tasks = store.getAllTasks()
      expect(tasks).toHaveLength(2)
      expect(tasks[0].title).toBe('Practice Spanish Greetings')
      expect(tasks[1].title).toBe('Learn French Numbers 1-10')
    })

    it('should not overwrite existing data when initializing', () => {
      const store = useTaskStore()
      store.createTask(mockTask)
      
      store.initializeWithDemoData()
      expect(store.getAllTasks()).toHaveLength(1) // Only the original task
    })
  })
}) 