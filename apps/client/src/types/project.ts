import type { ProjectCategory, ProjectPriority, ProjectStatus } from '../enums';

export interface Project {
  id: string;
  name: string;
  client: string | null;
  category: ProjectCategory;
  priority: ProjectPriority;
  status: ProjectStatus;
  hours_spent: number;
  hours_estimated?: number;
  deadline?: string;
  description?: string;
}

export interface Deliverable {
  id: string;
  project_id: string;
  title: string;
  deadline?: string;
  completed: boolean;
  created_at?: string;
}
