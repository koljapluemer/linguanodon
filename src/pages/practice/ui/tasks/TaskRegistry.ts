import type { Component } from 'vue';

export interface TaskComponent {
  component: Component;
  controlComponent?: Component;
}

/**
 * Registry for task type components within the practice page.
 * Maps task types to their corresponding Vue components.
 */
export class TaskRegistry {
  private static registry = new Map<string, TaskComponent>();

  /**
   * Register a task type with its component.
   */
  static register(type: string, taskComponent: TaskComponent) {
    this.registry.set(type, taskComponent);
  }

  /**
   * Get a task component by type.
   */
  static get(type: string): TaskComponent | undefined {
    return this.registry.get(type);
  }

  /**
   * Get all registered task types.
   */
  static getAll(): Map<string, TaskComponent> {
    return this.registry;
  }

  /**
   * Check if a task type is registered.
   */
  static has(type: string): boolean {
    return this.registry.has(type);
  }
} 