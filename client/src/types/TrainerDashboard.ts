export interface ITrainerDashboardStats {
  totalClients: number;
  totalSessions: number;
  earningsThisMonth: number;
  averageRating: number;
  upcomingSessions: number;
}

export interface IUpcomingSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  clientName: string;
  clientId: string;
  workoutType?: string; // Added for UI
  location?: string; // Added for UI
  status: string; // Added for UI
  profileImage?: string;
}

export interface IWeeklySessionStats {
  week: number;
  category: string;
  totalSessions: number;
}

export interface IClientFeedback {
  id: string;
  rating: number;
  comment?: string;
  clientName: string;
  clientProfileImage?: string;
  createdAt: Date;
}

export interface IEarningsReport {
  totalEarnings: number;
  platformCommission: number;
}

export interface IClientProgress {
  clientId: string;
  clientName: string;
  consistency: number;
  type: "most" | "least";
}

export interface ISessionHistory {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  clientName: string;
  clientId?: string;
  workoutType?: string; // Added for UI
  duration?: string; // Added for UI
  payment?: string; // Added for UI
}