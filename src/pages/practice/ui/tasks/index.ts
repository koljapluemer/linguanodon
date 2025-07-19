import { TaskRegistry } from './TaskRegistry';
import RevealTask from './reveal/RevealTask.vue';
import FreeTranslateTask from './free-translate/FreeTranslateTask.vue';
import ChooseFromTwoTask from './choose-from-two/ChooseFromTwoTask.vue';

// Register all task types
TaskRegistry.register('reveal', { component: RevealTask });
TaskRegistry.register('free-translate', { component: FreeTranslateTask });
TaskRegistry.register('choose-from-two', { component: ChooseFromTwoTask });

// Export the registry for use in other components
export { TaskRegistry };
export type { TaskComponent } from './TaskRegistry'; 