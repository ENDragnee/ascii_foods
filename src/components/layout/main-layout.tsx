"use client";

import React from 'react';
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

// API functions moved here as MainLayout now handles checkout
async function createOrder(items: CartItem[]) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
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

export default function MainLayout({ children, session }: MainLayoutProps) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Get cart state from Redux
  const { isVisible: isCartVisible, items: cartItemsMap } = useSelector((state: RootState) => state.cart);
  const isAuthenticated = !!session?.user;

  // --- Data Fetching & Mutations (Now in the Layout) ---
  const { data: menuItems = [] } = useQuery<MenuItem[]>({ queryKey: ["menus"], queryFn: fetchMenus });

  const placeOrderMutation = useMutation({
    mutationFn: createOrder,
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

  // --- Helper Functions to build the cart items array ---
  const getCartItems = (): CartItem[] => {
    return Object.entries(cartItemsMap).map(([id, quantity]) => {
      const menuItem = menuItems.find(item => item.id === id);
      return { ...menuItem!, quantity };
    }).filter(item => item.name); // Filter out any potential mismatches
  };

  const cartItemsArray = getCartItems();
  const total = cartItemsArray.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cartItemsArray.length > 0) {
      placeOrderMutation.mutate(cartItemsArray);
    }
  };

  const routeToSignIn = () => router.push('/auth?view=signin');

  // --- Conditional Rendering Logic ---
  const isHomePage = pathname === '/';
  const isAuthPage = pathname === '/auth';

  if (isHomePage || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar session={session} />

      <main className="flex-1 flex flex-col min-w-0 md:pb-0 pb-20">
        {children}
      </main>

      <BottomBar session={session} />

      {/* ✅ FIX: CartPreview is now rendered here, at the top level of the layout */}
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
