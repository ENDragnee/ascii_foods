import { useMemo } from "react";
import {
  LayoutDashboard,
  Utensils,
  BarChart2,
  FileText,
  ShoppingBag,
  History,
} from "lucide-react";
import { Session } from "@/types"; // Use your application's Session type

// Define the shape of a navigation link
export interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

// Define the links for each role
const USER_LINKS: NavLink[] = [
  { href: "/menu", label: "Menu", icon: Utensils },
  { href: "/orders", label: "My Orders", icon: ShoppingBag },
];

// ✅ UPDATED: Cashier now has a "Menu" link
const CASHIER_LINKS: NavLink[] = [
  { href: "/cashier", label: "Orders", icon: ShoppingBag },
  { href: "/menu", label: "Menu", icon: Utensils },
  { href: "/cashier/history", label: "History", icon: History },
];

// ✅ UPDATED: Admin links are reordered and include "Menu"
const ADMIN_LINKS: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/menu", label: "Manage Menu", icon: Utensils },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/reports", label: "Reports", icon: FileText },
];

// Link shown to unauthenticated users
const PUBLIC_LINK: NavLink = { href: "/menu", label: "Menu", icon: Utensils };

/**
 * A custom hook that returns the appropriate navigation links
 * based on the user's session and role.
 */
export const useNavigationLinks = (session: Session | null): NavLink[] => {
  const links = useMemo(() => {
    if (!session?.user) {
      return [PUBLIC_LINK];
    }

    switch (session.user.role) {
      case "USER":
        return USER_LINKS;
      case "CASHIER":
        return CASHIER_LINKS;
      case "ADMIN":
        return ADMIN_LINKS;
      default:
        return [PUBLIC_LINK];
    }
  }, [session]);

  return links;
};
