import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFoods } from "@/services/fetcher";
import { MenuItem } from "@/types";
import { toast } from "sonner";

// --- GraphQL Queries ---

const GET_RECENT_MENUS_QUERY = `
  query GetRecentMenus {
    getRecentMenus {
      id
      date
      name
      items {
        id
      }
    }
  }
`;

// --- Types ---

interface StoredMenu {
  date: Date;
  items: string[];
}

interface RecentMenuResponse {
  id: string;
  date: string;
  name: string;
  items: { id: string }[];
}

interface PublishPayload {
  date: string;
  items: string[];
}

// --- Helper: Safe Date Conversion ---
// This ensures that if you pick "Nov 25", it sends "Nov 25 UTC"
// regardless of your local timezone.
const getAsUTCString = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Create a date that is 00:00:00 UTC for the selected day
  const utcDate = new Date(Date.UTC(year, month, day));
  return utcDate.toISOString();
};

// --- API Fetchers ---

const fetchRecentMenus = async (): Promise<RecentMenuResponse[]> => {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: GET_RECENT_MENUS_QUERY }),
  });
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.getRecentMenus;
};

// API call for single daily menu
const publishDailyMenuApi = async (items: string[]) => {
  // ✅ FIX: Use getAsUTCString to ensure "Today" doesn't slip to "Yesterday" in UTC
  const datePayload = getAsUTCString(new Date());

  const response = await fetch("/api/menus/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, date: datePayload }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to publish menu");
  }
  return response.json();
};

// API call for multiple future menus
const publishMultipleMenusApi = async (menus: PublishPayload[]) => {
  const response = await fetch("/api/menus/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ menus }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to publish menus");
  }
  return response.json();
};

// --- Main Hook ---

export default function useMenuPublish() {
  const queryClient = useQueryClient();

  // -- State --
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [menuMode, setMenuMode] = useState<"daily" | "future">("daily");

  // Calendar State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [storedMenus, setStoredMenus] = useState<StoredMenu[]>([]);

  // -- Data Fetching --

  const { data: availableMenuItems = [] } = useQuery<MenuItem[]>({
    queryKey: ["admin-menu-items"],
    queryFn: fetchFoods,
  });

  const { data: rawRecentMenus = [] } = useQuery<RecentMenuResponse[]>({
    queryKey: ["admin-recent-menus"],
    queryFn: fetchRecentMenus,
    staleTime: 5 * 60 * 1000,
  });

  const previousMenus = useMemo(() => {
    return rawRecentMenus.map((menu) => ({
      id: menu.id,
      name: menu.name || new Date(menu.date).toLocaleDateString(),
      items: menu.items.map((i) => i.id),
    }));
  }, [rawRecentMenus]);

  // -- Computed Values --

  const categories = useMemo(() => {
    return Array.from(new Set(availableMenuItems.map((item) => item.category)));
  }, [availableMenuItems]);

  const publishedItems = useMemo(() => {
    return availableMenuItems.filter((item) => selectedItems.includes(item.id));
  }, [availableMenuItems, selectedItems]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // -- Helper Functions --

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const isSameDate = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const hasMenuOnDate = (day: number) => {
    const checkDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    return storedMenus.some((menu) =>
      isSameDate(new Date(menu.date), checkDate),
    );
  };

  const isSelectedDate = (day: number) => {
    const checkDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    return isSameDate(selectedDate, checkDate);
  };

  const isToday = (day: number) => {
    const today = new Date();
    const checkDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    return isSameDate(today, checkDate);
  };

  // -- Actions --

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
    setIsPublished(false);
  };

  const loadMenu = (items: string[]) => {
    setSelectedItems(items);
    toast.success("Menu layout loaded!");
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    setSelectedDate(newDate);

    const existingMenu = storedMenus.find((menu) =>
      isSameDate(new Date(menu.date), newDate),
    );
    if (existingMenu) {
      setSelectedItems(existingMenu.items);
    } else {
      setSelectedItems([]);
    }
  };

  const saveScheduledMenuToState = () => {
    setStoredMenus((prev) => {
      const filtered = prev.filter(
        (menu) => !isSameDate(new Date(menu.date), selectedDate),
      );
      if (selectedItems.length === 0) return filtered;
      return [...filtered, { date: selectedDate, items: selectedItems }];
    });
    toast.success(`Menu saved for ${selectedDate.toLocaleDateString()}`);
  };

  // Mutation for Single Day
  const publishMutation = useMutation({
    mutationFn: publishDailyMenuApi,
    onSuccess: () => {
      setIsPublished(true);
      queryClient.invalidateQueries({ queryKey: ["todaysMenu"] });
      queryClient.invalidateQueries({ queryKey: ["admin-recent-menus"] });
      toast.success("Today's menu published!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const publishMenu = () => {
    publishMutation.mutate(selectedItems);
  };

  // Mutation for Multiple Days
  const publishMultipleMutation = useMutation({
    mutationFn: publishMultipleMenusApi,
    onSuccess: () => {
      setIsPublished(true);
      setStoredMenus([]);
      queryClient.invalidateQueries({ queryKey: ["admin-recent-menus"] });
      toast.success("All scheduled menus published!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const publishMultipleMenus = () => {
    if (storedMenus.length === 0) return;

    // ✅ FIX: Use getAsUTCString to prevent timezone rollback
    const payload: PublishPayload[] = storedMenus.map((menu) => ({
      date: getAsUTCString(menu.date),
      items: menu.items,
    }));

    publishMultipleMutation.mutate(payload);
  };

  return {
    selectedItems,
    setSelectedItems,
    isPublished,
    showPreview,
    menuMode,
    selectedDate,
    currentMonth,
    availableMenuItems,
    storedMenus,
    setMenuMode,
    setShowPreview,
    setSelectedDate,
    setCurrentMonth,
    toggleItem,
    handleDateClick,
    saveScheduledMenuToState,
    publishMenu,
    publishMultipleMenus,
    getDaysInMonth,
    getFirstDayOfMonth,
    hasMenuOnDate,
    isSelectedDate,
    isToday,
    categories,
    publishedItems,
    monthNames,
    dayNames,
    previousMenus,
    loadMenu,
  };
}
