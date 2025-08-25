import type { ResourceData } from '@/entities/resources/ResourceData';
import type { TaskData } from '@/entities/tasks/Task';

export function generateExtractKnowledgeFromResource(resource: ResourceData): TaskData {
  const uid = `extract-knowledge-from-resource-${resource.uid}-${Date.now()}`;
  
  return {
    uid,
    taskType: 'extract-knowledge-from-resource',
    prompt: `Extract knowledge from "${resource.title}". Use the tabs to add vocabulary and create fact cards from this resource.`,
    associatedResources: [resource.uid]
  };
}

export function canGenerateExtractKnowledgeFromResource(resource: ResourceData): boolean {
  // Can only generate if resource hasn't finished extracting
  return !resource.finishedExtracting;
}