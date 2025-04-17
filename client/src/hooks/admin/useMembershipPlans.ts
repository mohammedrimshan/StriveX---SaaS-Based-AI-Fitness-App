import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
  getAllMembershipPlans,
} from "@/services/admin/adminService";
import {
  MembershipPlanType,
  MembershipPlanResponse,
  MembershipPlansPaginatedResponse,
} from "@/types/membership";
import { IAxiosResponse } from "@/types/Response";

interface UseMembershipPlansParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface UseMembershipPlansResult {
  plans: MembershipPlanType[];
  totalPages: number;
  currentPage: number;
  totalPlans: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  addPlan: (
    planData: { name: string; durationMonths: number; price: number,isActive: boolean }
  ) => Promise<MembershipPlanResponse>;
  updatePlan: (
    planId: string,
    planData: Partial<{
      name: string;
      durationMonths: number;
      price: number;
      isActive: boolean;
    }>
  ) => Promise<MembershipPlanResponse>;
  deletePlan: (planId: string) => Promise<IAxiosResponse>;
}

export const useMembershipPlans = ({
  page = 1,
  limit = 10,
  search = "",
}: UseMembershipPlansParams = {}): UseMembershipPlansResult => {
  const queryClient = useQueryClient();

  const {
    data: plansData,
    isLoading,
    isError,
    error,
  } = useQuery<MembershipPlansPaginatedResponse, Error>({
    queryKey: ["membershipPlans", page, limit, search],
    queryFn: () => getAllMembershipPlans({ page, limit, search }),
    placeholderData: (previousData) => previousData,
  });

  const addMutation = useMutation<
    MembershipPlanResponse,
    Error,
    { name: string; durationMonths: number; price: number }
  >({
    mutationFn: addMembershipPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membershipPlans"] });
    },
  });

  const updateMutation = useMutation<
    MembershipPlanResponse,
    Error,
    { planId: string; planData: Partial<MembershipPlanType> }
  >({
    mutationFn: ({ planId, planData }) =>
      updateMembershipPlan(planId, planData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membershipPlans"] });
    },
  });

  const deleteMutation = useMutation<IAxiosResponse, Error, string>({
    mutationFn: deleteMembershipPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membershipPlans"] });
    },
  });

  const addPlan = async (planData: {
    name: string;
    durationMonths: number;
    price: number;
  }) => {
    return addMutation.mutateAsync(planData);
  };

  const updatePlan = async (
    planId: string,
    planData: Partial<{
      name: string;
      durationMonths: number;
      price: number;
      isActive: boolean;
    }>
  ) => {
    return updateMutation.mutateAsync({ planId, planData });
  };

  const deletePlan = async (planId: string) => {
    return deleteMutation.mutateAsync(planId);
  };

  return {
    plans: plansData?.plans ?? [],
    totalPages: plansData?.totalPages ?? 1,
    currentPage: plansData?.currentPage ?? page,
    totalPlans: plansData?.totalPlans ?? 0,
    isLoading,
    isError,
    error,
    addPlan,
    updatePlan,
    deletePlan,
  };
};
