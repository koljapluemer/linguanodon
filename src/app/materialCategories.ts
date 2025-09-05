import { 
  BookOpen, 
  FileText, 
  Archive, 
  Target
} from 'lucide-vue-next';
import type { Component } from 'vue';

export interface MaterialCategory {
  name: string;
  description: string;
  icon: Component;
  route: { name: string };
}

export const materialCategories: MaterialCategory[] = [
  {
    name: 'Vocab',
    description: 'Vocabulary words and translations',
    icon: BookOpen,
    route: { name: 'vocab-list' },
  },
  {
    name: 'Fact Cards',
    description: 'Facts, cultural information, and concepts',
    icon: FileText,
    route: { name: 'fact-cards-list' },
  },
  {
    name: 'Resources',
    description: 'Articles, videos, and learning materials',
    icon: Archive,
    route: { name: 'resources-list' },
  },

  {
    name: 'Goals',
    description: 'Learning objectives and milestones',
    icon: Target,
    route: { name: 'goals-list' },
  }
];