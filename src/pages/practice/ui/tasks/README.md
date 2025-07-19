# Task System Architecture

This directory contains the task components for the practice page, organized using a registry pattern for extensibility.

## Structure

```
tasks/
├── TaskRegistry.ts              # Registry for task type components
├── index.ts                     # Registration of all task types
├── README.md                    # This file
├── reveal/
│   └── RevealTask.vue          # Basic reveal pattern (flashcards)
├── free-translate/
│   └── FreeTranslateTask.vue   # Translation with text input
└── choose-from-two/
    └── ChooseFromTwoTask.vue   # Multiple choice selection
```

## Architecture

### Task Registry Pattern

The `TaskRegistry` class manages the mapping between task types and their corresponding Vue components. This allows for:

- **Dynamic task resolution**: The `DoTaskRender` component can render any task type without knowing about specific implementations
- **Easy extensibility**: New task types can be added by creating a component and registering it
- **Type safety**: Each task component implements a consistent interface

### Task Component Interface

All task components must:

1. Accept a `Task` prop with the task data
2. Emit a `rate` event with the user's rating and optional user input
3. Handle their own internal state (like reveal status)
4. Not depend on external reveal logic

### Current Task Types

- **`reveal`**: Basic flashcard pattern with reveal button
- **`free-translate`**: Translation exercise with text input
- **`choose-from-two`**: Multiple choice selection (demo implementation)

## Adding New Task Types

1. Create a new directory under `tasks/` for your task type
2. Create a Vue component that follows the task interface
3. Register the component in `index.ts`
4. The task will automatically be available to the practice system

## Benefits

- **Separation of concerns**: Each task type handles its own UI logic
- **Maintainability**: Task-specific code is isolated
- **Testability**: Individual task components can be tested in isolation
- **Extensibility**: New task types can be added without modifying existing code
- **FSD compliance**: Components are organized within the page layer as intended 