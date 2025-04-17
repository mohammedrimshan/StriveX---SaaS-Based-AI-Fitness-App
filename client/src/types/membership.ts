export interface IMembershipPlanEntity {
    id?: string;
    name: string;
    durationMonths: number;
    price: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }
  

  export interface MembershipPlanType {
    id: string;
    name: string;
    durationMonths: number;
    price: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface MembershipPlanResponse {
    success: boolean;
    message: string;
    data: MembershipPlanType;
  }
  
  export interface MembershipPlansPaginatedResponse {
    success: boolean;
    plans: MembershipPlanType[];
    totalPages: number;
    currentPage: number;
    totalPlans: number;
  }