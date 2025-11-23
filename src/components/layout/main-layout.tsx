"use client";

import React, { useState, useRef } from 'react'; // ✅ Added useState, useRef
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { Sidebar } from './sidebar';
import { BottomBar } from './bottom-bar';
import CartPreview from '../cart-preview';
import { Session, CartItem, MenuItem } from '@/types';
import { RootState } from '@/store';
import { hideCart, clearCart } from '@/store/slices/cartSlice';
import { useSession } from '@/hooks/use-session';
import { OrderType } from '@/generated/prisma/enums';

// API functions moved here as MainLayout now handles checkout
async function createOrder(items: CartItem[], orderType: OrderType) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, orderType }),
  });
  if (!response.ok) throw new Error("Failed to place order.");
  return response.json();
}

async function fetchMenus(): Promise<MenuItem[]> {
  const response = await fetch("/api/menus");
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
}

interface MainLayoutProps {
  children: React.ReactNode;
  session: Session | null;
}

export default function MainLayout({ children, session: initialSession }: MainLayoutProps) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();

  // ✅ NEW: State to manage BottomBar visibility
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
  const lastScrollY = useRef(0);

  const { session } = useSession(initialSession);

  // Get cart state from Redux
  const { isVisible: isCartVisible, items: cartItemsMap, orderType } = useSelector((state: RootState) => state.cart);
  const isAuthenticated = !!session?.user;

  // --- Data Fetching & Mutations ---
  const { data: menuItems = [] } = useQuery<MenuItem[]>({ queryKey: ["menus"], queryFn: fetchMenus });

  const placeOrderMutation = useMutation({
    mutationFn: (items: CartItem[]) => createOrder(items, orderType),
    onSuccess: () => {
      dispatch(clearCart());
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      router.push('/orders');
    },
    onError: (error) => {
      console.error("Order failed:", error);
      alert("There was an error placing your order. Please try again.");
    },
  });

  // --- Helper Functions ---
  const getCartItems = (): CartItem[] => {
    return Object.entries(cartItemsMap).map(([id, quantity]) => {
      const menuItem = menuItems.find(item => item.id === id);
      return { ...menuItem!, quantity };
    }).filter(item => item.name);
  };

  const cartItemsArray = getCartItems();
  const total = cartItemsArray.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cartItemsArray.length > 0) {
      placeOrderMutation.mutate(cartItemsArray);
    }
  };

  const routeToSignIn = () => router.push('/auth?view=signin');

  // ✅ NEW: Scroll Handler Logic
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;

    // Always show if near the top to prevent getting stuck
    if (currentScrollY < 50) {
      setIsBottomBarVisible(true);
      lastScrollY.current = currentScrollY;
      return;
    }

    // Sensitivity threshold to prevent flickering on tiny scrolls
    const threshold = 10;

    if (Math.abs(currentScrollY - lastScrollY.current) > threshold) {
      if (currentScrollY > lastScrollY.current) {
        // Scrolling DOWN -> Hide
        setIsBottomBarVisible(false);
      } else {
        // Scrolling UP -> Show
        setIsBottomBarVisible(true);
      }
      lastScrollY.current = currentScrollY;
    }
  };

  // --- Conditional Rendering Logic ---
  const isHomePage = pathname === '/';
  const isAuthPage = pathname === '/auth';

  if (isHomePage || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <main
        className="flex-1 flex flex-col min-w-0 md:pb-0 pb-20 overflow-y-auto scroll-smooth"
        onScroll={handleScroll}
      >
        {children}
      </main>

      <div
        className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300 ease-in-out ${isBottomBarVisible ? 'translate-y-0' : 'translate-y-full'
          }`}
      >
        <BottomBar session={session} />
      </div>

      {isCartVisible && cartItemsArray.length > 0 && (
        <CartPreview
          items={cartItemsArray}
          total={total}
          isPlacingOrder={placeOrderMutation.isPending}
          isAuthenticated={isAuthenticated}
          routeToSignIn={routeToSignIn}
          onCheckout={handleCheckout}
          onClose={() => dispatch(hideCart())}
        />
      )}
    </div>
  );
}
