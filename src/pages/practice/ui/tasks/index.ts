import { TaskRegistry } from './TaskRegistry';
import RevealTask from './reveal/RevealTask.vue';
import FreeTranslateTask from './free-translate/FreeTranslateTask.vue';
import TryToRememberTask from './try-to-remember/TryToRememberTask.vue';
import ChooseFromTwoTask from './choose-from-two/ChooseFromTwoTask.vue';
import ChooseFromFourTask from './choose-from-four/ChooseFromFourTask.vue';
import ResourceExtractionTask from './resource-extraction/ResourceExtractionTask.vue';
import MissingTranslationTask from './missing-translation/MissingTranslationTask.vue';
import MilestoneTask from './milestone/MilestoneTask.vue';

// Register all task types
TaskRegistry.register('reveal', { component: RevealTask });
TaskRegistry.register('free-translate', { component: FreeTranslateTask });
TaskRegistry.register('try-to-remember', { component: TryToRememberTask });
TaskRegistry.register('choose-from-two', { component: ChooseFromTwoTask });
TaskRegistry.register('choose-from-four', { component: ChooseFromFourTask });
TaskRegistry.register('resource-extraction', { component: ResourceExtractionTask });
TaskRegistry.register('missing-translation', { component: MissingTranslationTask });
TaskRegistry.register('milestone', { component: MilestoneTask });

// Export the registry for use in other components
export { TaskRegistry };
export type { TaskComponent } from './TaskRegistry'; 