export const queryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  activeProjects: ['projects', 'active'] as const,
  timeEntries: (projectId?: string) => ['time-entries', projectId ?? 'all'] as const,
  deliverables: (projectId: string) => ['deliverables', projectId] as const,
  analytics: (year: number) => ['analytics', year] as const,
  calendar: (month: string) => ['calendar-activities', month] as const,
};
