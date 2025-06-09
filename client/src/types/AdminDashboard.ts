
export interface IDashboardStats {
  totalRevenue: number;
  totalUsers: number;
  totalTrainers: number;
  totalCategories: number;
  activeSessions: number;
  monthlyFinancials: IMonthlyFinancials[];
}

export interface IMonthlyFinancials {
  month: string;
  totalIncome: number;
  profit: number;
}

export interface ITopTrainer {
  id: string;
  name: string;
  skills: string[];
  totalClients: number;
}

export interface IPopularWorkout {
  id: string;
  name: string;
  category: string;
  enrolledClients: number;
  growthPercentage: number;
}

export interface IUserAndSessionData {
  monthlySignups: IMonthlySignups[];
  sessionOverview: ISessionOverview[];
}

export interface IMonthlySignups {
  month: string;
  totalSignups: number;
}

export interface ISessionOverview {
  period: string;
  totalSessions: number;
}

export interface IRevenueReport {
  month: string;
  totalRevenue: number;
  totalTrainerEarnings: number;
  totalProfit: number;
}

export interface ISessionReport {
  date: string;
  totalSessions: number;
  uniqueClientsCount: number;
}

export interface AdminDashboardResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
