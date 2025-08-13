import { 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Archive, 
  Target,
  Waves
} from 'lucide-vue-next';
import type { Component } from 'vue';

export interface MaterialCategory {
  name: string;
  description: string;
  icon: Component;
  route: { name: string };
  color: string;
}

export const materialCategories: MaterialCategory[] = [
  {
    name: 'Vocab',
    description: 'Vocabulary words and translations',
    icon: BookOpen,
    route: { name: 'vocab-list' },
    color: 'text-blue-600'
  },
  {
    name: 'Examples',
    description: 'Example sentences and phrases',
    icon: MessageSquare,
    route: { name: 'examples-list' },
    color: 'text-green-600'
  },
  {
    name: 'Fact Cards',
    description: 'Facts, cultural information, and concepts',
    icon: FileText,
    route: { name: 'fact-cards-list' },
    color: 'text-purple-600'
  },
  {
    name: 'Resources',
    description: 'Articles, videos, and learning materials',
    icon: Archive,
    route: { name: 'resources-list' },
    color: 'text-orange-600'
  },
  {
    name: 'Immersion Content',
    description: 'Native content for language immersion',
    icon: Waves,
    route: { name: 'immersion-content-list' },
    color: 'text-teal-600'
  },
  {
    name: 'Goals',
    description: 'Learning objectives and milestones',
    icon: Target,
    route: { name: 'goals-list' },
    color: 'text-red-600'
  }
];