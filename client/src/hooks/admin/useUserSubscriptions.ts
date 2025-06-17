import { useQuery } from "@tanstack/react-query";
import { FetchSubscriptionsParams, SubscriptionsResponse } from "@/types/subscription.types";
import { getUserSubscriptions } from "@/services/admin/adminService";

export const useUserSubscriptions = ({
  page = 1,
  limit = 10,
  search = "",
  status = "all",
}: FetchSubscriptionsParams) => {
  return useQuery<
    SubscriptionsResponse,
    Error,
    SubscriptionsResponse,
    [string, FetchSubscriptionsParams]
  >({
    queryKey: ["subscriptions", { page, limit, search, status }],
    queryFn: () => getUserSubscriptions({ page, limit, search, status }),
    staleTime: 5 * 60 * 1000,
  });
};
