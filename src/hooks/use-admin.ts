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
  averageCompletionTime: number;
}

interface TopSellerData {
  food: MenuItem;
  sales: number;
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
      averageCompletionTime 
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
    throw new Error(
      result.errors[0].message || "Failed to fetch admin dashboard stats.",
    );
  }

  return result.data.getAdminDashboardStats;
};

export function useAdminDashboardStats() {
  return useQuery<AdminDashboardStatsData, Error>({
    queryKey: ["adminDashboardStats"], // Unique key for this query
    queryFn: fetchAdminDashboardStats, // The function that fetches the data
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

const GET_TOP_SELLING_ITEMS_QUERY = `
  query GetTopSellingItems {
    getTopSellingItems {
      food { id, name, imageUrl },
      sales
    }
  }
`;

const fetchTopSellingItems = async (): Promise<TopSellerData[]> => {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: GET_TOP_SELLING_ITEMS_QUERY }),
  });
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.getTopSellingItems;
};
export function useTopSellingItems() {
  return useQuery<TopSellerData[], Error>({
    queryKey: ["topSellingItems"],
    queryFn: fetchTopSellingItems,
    refetchInterval: 5 * 60 * 1000,
  }); // Refetch every 5 mins
}

// --- ✅ NEW: Hook for today's menu ---
const GET_TODAYS_MENU_QUERY = `
  query GetTodaysMenu {
    getTodaysMenu {
      id, name, imageUrl
    }
  }
`;
const fetchTodaysMenu = async (): Promise<MenuItem[]> => {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: GET_TODAYS_MENU_QUERY }),
  });
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.getTodaysMenu;
};
export function useTodaysMenu() {
  return useQuery<MenuItem[], Error>({
    queryKey: ["todaysMenu"],
    queryFn: fetchTodaysMenu,
    staleTime: 60 * 60 * 1000,
  }); // Stale for 1 hour
}

