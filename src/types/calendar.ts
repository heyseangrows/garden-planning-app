export type ActionType =
  | 'indoor-sow'
  | 'direct-sow'
  | 'plant-out'
  | 'harvest'
  | 'nothing';

export interface CalendarAction {
  type: ActionType;
  startDate: Date;
  endDate: Date;
  label: string;
  details?: string;
}

export interface CalendarEntry {
  varietyId: string;
  monthIndex: number;
  year: number;
  actions: CalendarAction[];
}

export interface CalendarRow {
  varietyId: string;
  varietyName: string;
  entries: CalendarEntry[];
}

export interface CalendarData {
  rows: CalendarRow[];
  months: { index: number; label: string; year: number }[];
}
