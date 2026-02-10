import {
  IconBug,
  IconCalendarEvent,
  IconClipboardList,
  IconCode,
  IconDeviceLaptop,
  IconPalette,
} from '@tabler/icons-vue';
import type { Component } from 'vue';

export const ACTIVITY_TYPES = {
  REUNION: 'Reunión',
  BUGFIX: 'Bugfix',
  DISENO: 'Diseño',
  PLANEACION: 'Planeación',
  DESARROLLO: 'Desarrollo',
} as const;

export const ACTIVITY_CONFIG: Record<
  string,
  { icon: Component; label: string; color: string }
> = {
  [ACTIVITY_TYPES.REUNION]: {
    icon: IconCalendarEvent,
    label: 'Reunión',
    color: 'text-amber-600',
  },
  [ACTIVITY_TYPES.BUGFIX]: {
    icon: IconBug,
    label: 'Bugfix',
    color: 'text-red-600',
  },
  [ACTIVITY_TYPES.DISENO]: {
    icon: IconPalette,
    label: 'Diseño',
    color: 'text-purple-600',
  },
  [ACTIVITY_TYPES.PLANEACION]: {
    icon: IconClipboardList,
    label: 'Planeación',
    color: 'text-green-600',
  },
  [ACTIVITY_TYPES.DESARROLLO]: {
    icon: IconCode,
    label: 'Desarrollo',
    color: 'text-blue-600',
  },
};

export const DEFAULT_ACTIVITY_CONFIG = {
  icon: IconDeviceLaptop,
  label: 'Actividad',
  color: 'text-gray-600',
};

export const getActivityConfig = (type: string) => {
  return ACTIVITY_CONFIG[type] || DEFAULT_ACTIVITY_CONFIG;
};
