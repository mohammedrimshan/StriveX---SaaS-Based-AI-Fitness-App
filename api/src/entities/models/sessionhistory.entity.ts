import { SlotStatus } from "@/shared/constants";

export interface ISessionHistoryEntity {
  id?: string;
  trainerId: string;
  clientId?: string;
  status: SlotStatus;
  date: string;
}
