// client/src/hooks/admin/useAllCategory.ts
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
    queryFn: () => queryFunc({ page, limit, search }),
    placeholderData: (prevData) => prevData,
  });
};

export const useAllCategoryMutation = (
  addEditFunc: (data: { id?: string; name: string; description?: string }) => Promise<IAxiosResponse>,
  toggleStatusFunc: (categoryId: string, status: boolean) => Promise<IAxiosResponse>,
  deleteFunc: (categoryId: string) => Promise<IAxiosResponse>
) => {
  const queryClient = useQueryClient();
  return useMutation<
    IAxiosResponse,
    Error,
    { id?: string; name?: string; description?: string; status?: boolean; action?: "add" | "edit" | "toggle" | "delete" }
  >({
    mutationFn: async (data) => {
      if (data.action === "delete") {
        return await deleteFunc(data.id!);
      } else if (data.action === "toggle") {
        return await toggleStatusFunc(data.id!, data.status!);
      } else {
        return await addEditFunc({
          id: data.id,
          name: data.name!,
          description: data.description,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paginated-categories"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });
};