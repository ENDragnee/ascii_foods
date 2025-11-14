import { useQuery } from "@tanstack/react-query";
import { fetchFoods } from "@/services/fetcher";
import { MenuItem } from "@/types/index";

export function useAdminMenu() {
  return useQuery<MenuItem[], Error>({
    queryKey: ["admin-menu"],
    queryFn: fetchFoods,
  });
}