import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchFoods } from "@/services/fetcher";
import { MenuItem } from "@/types/index";

// --- Shared Types ---

export interface OrderFilterParams {
  page: number;
  pageSize: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedData<T> {
  items: T[];
  totalCount: number;
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

// ✅ FIX: Define a specific type for Admin Orders to replace 'any'
export interface AdminOrder {
  id: string;
  food: {
    name: string;
    imageUrl?: string | null;
  };
  user: {
    name: string;
    email: string;
  };
  quantity: number;
  totalPrice: number;
  createdAt: string;
  bonoNumber?: number | null;
  orderStatus: string;
}

// --- Analytics Specific Types ---
interface TimeDataPoint {
  time: string;
  value: number;
}

interface RankedFoodItem {
  food: { name: string };
  value: number;
}

interface RankedUser {
  user: { name: string };
  value: number;
}

interface AnalyticsData {
  ordersOverTime: TimeDataPoint[];
  topSellingFoods: RankedFoodItem[];
  topRevenueFoods: RankedFoodItem[];
  topCustomers: RankedUser[];
}

// --- Existing Hooks ---

export function useAdminMenu() {
  return useQuery<MenuItem[], Error>({
    queryKey: ["admin-menu"],
    queryFn: fetchFoods,
  });
}

// --- Dashboard Stats Hook ---
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: GET_ADMIN_DASHBOARD_STATS_QUERY }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.getAdminDashboardStats;
};

export function useAdminDashboardStats() {
  return useQuery<AdminDashboardStatsData, Error>({
    queryKey: ["adminDashboardStats"],
    queryFn: fetchAdminDashboardStats,
    refetchInterval: 30000,
  });
}

// --- Top Selling Items Hook (Dashboard) ---
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
  });
}

// --- Today's Menu Hook (Dashboard) ---
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
  });
}

// --- ✅ NEW: Paginated Orders Hook (Reports Page) ---
// Removed unused constant GET_ORDERS_QUERY

const fetchAdminOrders = async (
  params: OrderFilterParams,
): Promise<PaginatedData<AdminOrder>> => {
  // ✅ FIX: Replaced 'any' with 'AdminOrder'
  const query = `
    query GetOrders($skip: Int!, $take: Int!, $search: String, $startDate: String, $endDate: String, $status: String, $sortBy: String, $sortOrder: String) {
      getOrders(skip: $skip, take: $take, search: $search, startDate: $startDate, endDate: $endDate, status: $status, sortBy: $sortBy, sortOrder: $sortOrder) {
        orders {
          id
          food { name, imageUrl }
          user { name, email } # Fetch user info
          quantity
          totalPrice
          createdAt
          bonoNumber
          orderStatus
        }
        totalCount
      }
    }
  `;

  const variables = {
    skip: (params.page - 1) * params.pageSize,
    take: params.pageSize,
    search: params.search || undefined,
    startDate: params.startDate || undefined,
    endDate: params.endDate || undefined,
    status: params.status || undefined,
    sortBy: params.sortBy || undefined,
    sortOrder: params.sortOrder || undefined,
  };

  const res = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const result = await res.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return {
    items: result.data.getOrders.orders,
    totalCount: result.data.getOrders.totalCount,
  };
};

export function useAdminOrders(params: OrderFilterParams) {
  return useQuery({
    queryKey: ["adminOrders", params],
    queryFn: () => fetchAdminOrders(params),
    placeholderData: keepPreviousData,
  });
}

// --- ✅ NEW: Paginated Foods Hook (Reports Page) ---
const GET_FOODS_QUERY = `
  query GetFoods($skip: Int!, $take: Int!) {
    getFoods(skip: $skip, take: $take) {
      foods { id, name, price, imageUrl }
      totalCount
    }
  }
`;

const fetchAdminFoods = async (
  page: number,
  pageSize: number,
): Promise<PaginatedData<MenuItem>> => {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: GET_FOODS_QUERY,
      variables: { skip: (page - 1) * pageSize, take: pageSize },
    }),
  });
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return {
    items: result.data.getFoods.foods,
    totalCount: result.data.getFoods.totalCount,
  };
};

export function useAdminFoods(page: number, pageSize: number) {
  return useQuery({
    queryKey: ["adminFoods", page, pageSize],
    queryFn: () => fetchAdminFoods(page, pageSize),
    placeholderData: keepPreviousData,
  });
}

// --- ✅ NEW: Admin Analytics Hook (Analytics Page) ---
const GET_ANALYTICS_QUERY = `
  query GetAdminAnalytics {
    getAdminAnalytics {
      ordersOverTime { time, value }
      topSellingFoods { food { name }, value }
      topRevenueFoods { food { name }, value }
      topCustomers { user { name }, value }
    }
  }
`;

const fetchAdminAnalytics = async (): Promise<AnalyticsData> => {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: GET_ANALYTICS_QUERY }),
  });
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.getAdminAnalytics;
};

export function useAdminAnalytics() {
  return useQuery<AnalyticsData, Error>({
    queryKey: ["adminAnalytics"],
    queryFn: fetchAdminAnalytics,
    staleTime: 5 * 60 * 1000,
  });
}
