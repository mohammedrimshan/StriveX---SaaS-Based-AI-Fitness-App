export type Weekday =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export interface RuleBasedSlotInput {
  trainerId: string;
  rules: Partial<Record<Weekday, { start: string; end: string }>>;
  fromDate: string; // "YYYY-MM-DD"
  toDate: string;   // "YYYY-MM-DD"
  slotDurationInMinutes?: number;
}
