import type { ResourceData } from '@/entities/resources/ResourceData';
import type { Task } from '@/pages/practice/Task';

export function generateExtractKnowledgeFromResource(resource: ResourceData): Task {
  const uid = `extract-knowledge-from-resource-${resource.uid}-${Date.now()}`;
  
  return {
    uid,
    language: resource.language,
    taskType: 'extract-knowledge-from-resource',
    prompt: `Extract useful knowledge from this resource.`,
    associatedResources: [resource.uid]
  };
}