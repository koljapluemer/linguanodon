import type { ResourceData } from '@/entities/resources/ResourceData';
import type { Task } from '@/pages/practice/Task';

export function generateConsumeImmersionContent(resource: ResourceData): Task {
  const uid = `consume-immersion-content-${resource.uid}-${Date.now()}`;
  
  return {
    uid,
    language: resource.language,
    taskType: 'consume-immersion-content',
    prompt: `Watch/read this content and see how much you understand`,
    associatedResources: [resource.uid]
  };
}
