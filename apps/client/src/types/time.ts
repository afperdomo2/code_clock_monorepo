export interface TimeEntryForm {
  project_id: string;
  activity_type: string;
  description: string;
  date: string;
  duration: number;
}

export interface TimeEntry extends TimeEntryForm {
  id: string;
  created_at?: string;
  end_time?: string;
}

export interface TimeEntryWithProject extends TimeEntry {
  projects?: {
    id: string;
    name: string;
  } | null;
}
