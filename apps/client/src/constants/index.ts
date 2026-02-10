import { ProjectCategory, ProjectPriority, ProjectStatus } from '../enums';

export const PROJECT_CATEGORIES = Object.values(ProjectCategory);
export const PROJECT_PRIORITIES = Object.values(ProjectPriority);
export const PROJECT_STATUSES = Object.values(ProjectStatus);

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  [ProjectCategory.EMPRESA]: 'Empresa',
  [ProjectCategory.PERSONAL]: 'Personal',
  [ProjectCategory.FREELANCE]: 'Freelance',
};

export const PROJECT_PRIORITY_LABELS: Record<ProjectPriority, string> = {
  [ProjectPriority.ALTA]: 'Alta',
  [ProjectPriority.MEDIA]: 'Media',
  [ProjectPriority.BAJA]: 'Baja',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVO]: 'Activo',
  [ProjectStatus.FINALIZADO]: 'Finalizado',
  [ProjectStatus.PAUSA]: 'Pausa',
  [ProjectStatus.PENDIENTE]: 'Pendiente',
};

export const PROJECT_CATEGORY_OPTIONS = PROJECT_CATEGORIES.map((value) => ({
  value,
  label: PROJECT_CATEGORY_LABELS[value],
}));

export const PROJECT_PRIORITY_OPTIONS = PROJECT_PRIORITIES.map((value) => ({
  value,
  label: PROJECT_PRIORITY_LABELS[value],
}));

export const PROJECT_STATUS_OPTIONS = PROJECT_STATUSES.map((value) => ({
  value,
  label: PROJECT_STATUS_LABELS[value],
}));
