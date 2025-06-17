
import { IAxiosResponse } from "@/types/Response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface FetchCategoryParams {
  page: number;
  limit: number;
  search: string;
}

export interface CategoryType {
  _id: string;
  title: string;
  metValue: number;
  description?: string;
  status: boolean;
  categoryId?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export type CategoryResponse = {
  success: boolean;
  categories: CategoryType[];
  totalPages: number;
  currentPage: number;
  totalCategory: number;
};

export const useAllCategoryAdminQuery = (
  queryFunc: (params: FetchCategoryParams) => Promise<CategoryResponse>,
  page: number,
  limit: number,
  search: string
) => {
  return useQuery({
    queryKey: ["paginated-categories", page, limit, search],
    queryFn: () => {
      console.log("Fetching categories:", { page, limit, search });
      return queryFunc({ page, limit, search });
    },
    placeholderData: (prevData) => prevData,
  });
};

export const useAllCategoryMutation = (
  addEditFunc: (data: { id?: string; name: string; metValue: number; description?: string }) => Promise<IAxiosResponse>,
  toggleStatusFunc: (categoryId: string, status: boolean) => Promise<IAxiosResponse>
) => {
  const queryClient = useQueryClient();
  return useMutation<
    IAxiosResponse,
    Error,
    {
      id?: string;
      name?: string;
      metValue: number;
      description?: string;
      status?: boolean;
      action?: "add" | "edit" | "toggle";
      page?: number;
      limit?: number;
      search?: string;
    }
  >({
    mutationFn: async (data) => {
      console.log("Mutation triggered:", data);
      if (data.action === "toggle") {
        return await toggleStatusFunc(data.id!, data.status!);
      } else {
        return await addEditFunc({
          id: data.id,
          name: data.name!,
          metValue: data.metValue,
          description: data.description,
        });
      }
    },
    onSuccess: (_, variables) => {
      console.log("Mutation success:", variables.action);
      if (variables.action === "toggle") {
        queryClient.setQueryData<CategoryResponse>(
          ["paginated-categories", variables.page, variables.limit, variables.search],
          (oldData) => {
            if (!oldData) return oldData;
            console.log("Updating cache for toggle:", { id: variables.id, newStatus: variables.status });
            return {
              ...oldData,
              categories: oldData.categories.map((cat) =>
                cat._id === variables.id ? { ...cat, status: variables.status! } : cat
              ),
            };
          }
        );
      } else {
        console.log("Invalidating paginated-categories for add/edit");
        queryClient.invalidateQueries({ queryKey: ["paginated-categories"] });
      }
    },
    onError: (error) => {
      console.log("Mutation error:", error);
      console.error("Mutation error:", error.message);
    },
  });
};