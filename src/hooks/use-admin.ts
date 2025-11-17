import { useQuery } from "@tanstack/react-query";
import { fetchFoods } from "@/services/fetcher";
import { MenuItem } from "@/types/index";

export function useAdminMenu() {
  return useQuery<MenuItem[], Error>({
    queryKey: ["admin-menu"],
    queryFn: fetchFoods,
  });
}

interface AdminDashboardStatsData {
  newOrdersCount: number;
  preparingCount: number;
  readyCount: number;
  totalOrdersCompletedToday: number;
  completionRate: number;
  // avgOrderTime is not provided by your current GraphQL schema,
}

// Define your GraphQL query as a string
const GET_ADMIN_DASHBOARD_STATS_QUERY = `
  query GetAdminDashboardStats {
    getAdminDashboardStats {
      newOrdersCount
      preparingCount
      readyCount
      totalOrdersCompletedToday
      completionRate
    }
  }
`;

const fetchAdminDashboardStats = async (): Promise<AdminDashboardStatsData> => {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: GET_ADMIN_DASHBOARD_STATS_QUERY,
    }),
  });

  const result = await response.json();

  if (result.errors) {
    console.error("GraphQL Errors:", result.errors);
    throw new Error(result.errors[0].message || "Failed to fetch admin dashboard stats.");
  }

  return result.data.getAdminDashboardStats;
};

export function useAdminDashboardStats() {
  return useQuery<AdminDashboardStatsData, Error>({
    queryKey: ["adminDashboardStats"], // Unique key for this query
    queryFn: fetchAdminDashboardStats, // The function that fetches the data
  });
}