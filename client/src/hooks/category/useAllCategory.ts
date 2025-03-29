import { useQuery } from "@tanstack/react-query";
import { CategoryResponse } from "@/services/admin/adminService";


export const useAllCategoryQuery = (
  queryFunc: () => Promise<CategoryResponse>
) => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => queryFunc(),
  });
};
