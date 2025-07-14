/**
 * Returns a mock in-memory repository for testing and development.
 */
import type { Task, TaskAttempt } from "@/entities/Task";
import type { TaskRepository } from "@/repositories/interfaces/TaskRepository";

/**
 * Use for dependency injection in tests or development to avoid real persistence.
 */
export function mockTaskRepository(): TaskRepository {
    const dataSource: Task[] = [
        // Demo task for learning greetings
        {
            language: 'en',
            content: 'Learn Basic Greetings',
            primaryUnitsOfMeaning: [
                { language: 'en', content: 'Hello world' }
            ],
            secondaryUnitsOfMeaning: [
                { language: 'es', content: 'hola mundo' }
            ],
            lastDownloadedAt: new Date('2024-01-01'),
            lastPracticedAt: null,
            isCompleted: false,
            nextShownEarliestAt: new Date('2024-01-01'),
            interval: 1,
            attempts: []
        },
        // Demo task for vocabulary
        {
            language: 'es',
            content: 'Essential Vocabulary',
            primaryUnitsOfMeaning: [
                { language: 'es', content: 'hola mundo' }
            ],
            secondaryUnitsOfMeaning: [
                { language: 'en', content: 'Hello world' }
            ],
            lastDownloadedAt: new Date('2024-01-01'),
            lastPracticedAt: new Date('2024-01-15'),
            isCompleted: true,
            nextShownEarliestAt: new Date('2024-01-15'),
            interval: 7,
            attempts: [
                {
                    ease: 3,
                    correctness: 1,
                    timestamp: new Date('2024-01-15')
                }
            ]
        }
    ];

    return {
        /**
         * Adds a task to the mock store.
         */
        async addTask(task: Task) {
            if (!dataSource.some(t => t.language === task.language && t.content === task.content)) {
                dataSource.push(task);
            }
            return Promise.resolve();
        },
        /**
         * Removes a task by language and content.
         */
        async deleteTask(language: string, content: string) {
            const idx = dataSource.findIndex(t => t.language === language && t.content === content);
            if (idx !== -1) {
                dataSource.splice(idx, 1);
            }
            return Promise.resolve();
        },
        /**
         * Finds a task by language and content, or returns null if not found.
         */
        async findTask(language: string, content: string) {
            return Promise.resolve(dataSource.find(t => t.language === language && t.content === content) || null);
        },
        /**
         * Returns all tasks.
         */
        async getAllTasks() {
            return Promise.resolve([...dataSource]);
        },
        /**
         * Returns all tasks for a given language.
         */
        async getTasksByLanguage(language: string) {
            return Promise.resolve(dataSource.filter(t => t.language === language));
        },
        /**
         * Adds a task attempt.
         */
        async addTaskAttempt(language: string, content: string, attempt: TaskAttempt) {
            const task = dataSource.find(t => t.language === language && t.content === content);
            if (task) {
                task.attempts.push(attempt);
            }
            return Promise.resolve();
        },
        /**
         * Updates the last practiced timestamp for a task.
         */
        async updateTaskLastPracticedAt(language: string, content: string) {
            const task = dataSource.find(t => t.language === language && t.content === content);
            if (task) {
                task.lastPracticedAt = new Date();
            }
            return Promise.resolve();
        }
    };
}
