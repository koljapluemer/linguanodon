import { TaskRegistry } from './TaskRegistry';
import RevealTask from './reveal/RevealTask.vue';
import FreeTranslateTask from './free-translate/FreeTranslateTask.vue';
import TryToRememberTask from './try-to-remember/TryToRememberTask.vue';

// Register all task types
TaskRegistry.register('reveal', { component: RevealTask });
TaskRegistry.register('free-translate', { component: FreeTranslateTask });
TaskRegistry.register('try-to-remember', { component: TryToRememberTask });

// Export the registry for use in other components
export { TaskRegistry };
export type { TaskComponent } from './TaskRegistry'; 