import { useQuery } from "@tanstack/react-query";
import { CategoryResponse } from "../admin/useAllCategory";


export const useAllCategoryQuery = (
  queryFunc: () => Promise<CategoryResponse>
) => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => queryFunc(),
  });
};
