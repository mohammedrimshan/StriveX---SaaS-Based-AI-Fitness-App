export interface Subscription {
  clientId: string;
  clientName: string;
  profileImage?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  isExpired: boolean;
  daysUntilExpiration: number;
  membershipPlanId?: string;
  planName?: string;
  amount?: number;
  status: string;
}

export interface FetchSubscriptionsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "active" | "expired";
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
  totalPages: number;
  currentPage: number;
  totalSubscriptions: number;
}