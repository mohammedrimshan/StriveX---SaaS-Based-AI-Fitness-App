import { UserRole } from "./UserRole";

export interface SessionItem {
  id: string;
  trainerId: string;
  trainerName: string;
  clientId: string;
  clientName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  videoCallStatus: string;
  bookedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionHistoryProps {
  role: UserRole;
}

export type StatusVariant = 'default' | 'destructive' | 'secondary' | 'outline';