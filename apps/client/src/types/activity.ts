export interface ActivityEvent {
  id: string;
  date: string;
  title: string;
  type: string;
  projectId?: string;
  projectName?: string;
  description?: string;
  duration?: string;
}
