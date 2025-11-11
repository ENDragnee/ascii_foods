"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { LayoutGrid, List, Search } from "lucide-react";
import { useRouter } from "next/navigation"; // Import the App Router's router

import MenuCard from "./menu-card";
import CartPreview from "./cart-preview";
import { MenuTableRow } from "./menu-table-row";
import LoginPromptModal from "@/components/modals/login-prompt-modal";
import { toggleViewMode } from "@/store/slices/viewModeSlice";
import { RootState } from "@/store";
import { MenuItem, CartItem } from "@/types";

interface MenuExperienceProps {
  onBackAction: () => void;
}

// Map database categories from your Prisma schema to user-friendly UI
const CATEGORIES = [
  { key: "all", label: "All", emoji: "📋" },
  { key: "favorites", label: "Favorites", emoji: "⭐" },
  { key: "NORMAL", label: "Main", emoji: "🍽️" },
  { key: "SPECIAL", label: "Specialty", emoji: "✨" },
  { key: "HOTDRINK", label: "Hot Drinks", emoji: "☕" },
  { key: "JUICE", label: "Juice", emoji: "🍹" },
];

// --- API Fetcher Functions ---
async function fetchMenus(): Promise<MenuItem[]> {
  const response = await fetch("/api/menus");
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
}

async function fetchFavorites(): Promise<string[] | null> {
  const response = await fetch("/api/favorites");
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Failed to fetch favorites");
  return response.json();
}

async function toggleFavorite(foodId: string) {
  const response = await fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ foodId }),
  });
  if (!response.ok) throw new Error("Failed to toggle favorite");
  return response.json();
}

// New API function for creating an order
async function createOrder(items: CartItem[]) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    throw new Error("Failed to place order.");
  }
  return response.json();
}

export default function MenuExperience({ onBackAction }: MenuExperienceProps) {
  const queryClient = useQueryClient();
  const router = useRouter(); // Initialize the router
  const viewMode = useSelector((state: RootState) => state.viewMode.mode);
  const dispatch = useDispatch();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // --- Data Fetching with React Query ---
  const { data: menuItems = [], isLoading: isMenuLoading, isError: isMenuError } = useQuery<MenuItem[]>({
    queryKey: ["menus"],
    queryFn: fetchMenus,
  });

  const { data: favoriteIds, isLoading: isFavoritesLoading } = useQuery<string[] | null>({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
    staleTime: 5 * 60 * 1000,
  });

  const isAuthenticated = favoriteIds !== null && favoriteIds !== undefined;
  const favoritesSet = useMemo(() => new Set(favoriteIds || []), [favoriteIds]);

  // --- Mutations for Favorites and Orders ---
  const toggleFavoriteMutation = useMutation({
    mutationFn: toggleFavorite,
    onMutate: async (foodId: string) => {
      await queryClient.cancelQueries({ queryKey: ["favorites"] });
      const previousFavorites = queryClient.getQueryData<string[] | null>(["favorites"]);
      if (!previousFavorites) return { previousFavorites: [] };
      const newFavorites = favoritesSet.has(foodId)
        ? previousFavorites.filter((id) => id !== foodId)
        : [...previousFavorites, foodId];
      queryClient.setQueryData(["favorites"], newFavorites);
      return { previousFavorites };
    },
    onError: (err, _foodId, context) => {
      if (context?.previousFavorites !== undefined) {
        queryClient.setQueryData(["favorites"], context.previousFavorites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      // On successful order, clear the cart, close the preview,
      // invalidate the orders query, and redirect the user.
      setCart(new Map());
      setShowCart(false);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      router.push('/orders');
    },
    onError: (error) => {
      // In a real app, you would show a toast notification here.
      console.error("Order failed:", error);
      alert("There was an error placing your order. Please try again.");
    },
  });

  // --- Event Handlers ---
  const handleToggleFavorite = (foodId: string) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    toggleFavoriteMutation.mutate(foodId);
  };

  const handleCategorySelect = (categoryKey: string) => {
    if (categoryKey === "favorites") {
      if (isFavoritesLoading) return;
      if (!isAuthenticated) {
        setShowLoginPrompt(true);
      } else {
        setSelectedCategory("favorites");
      }
    } else {
      setSelectedCategory(categoryKey);
    }
  };

  const handleCheckout = () => {
    const cartItems = getCartItems();
    if (cartItems.length > 0) {
      placeOrderMutation.mutate(cartItems);
    }
  };

  // --- Filtering Logic ---
  const filteredItems = useMemo(() => {
    let items: MenuItem[] = menuItems;
    if (selectedCategory === "favorites") {
      items = items.filter((item) => favoritesSet.has(item.id));
    } else if (selectedCategory !== "all") {
      items = items.filter((item) => item.category.toUpperCase() === selectedCategory.toUpperCase());
    }
    if (searchQuery.trim() !== "") {
      items = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return items;
  }, [selectedCategory, searchQuery, menuItems, favoritesSet]);

  // --- Cart Logic ---
  const addToCart = (id: string) => setCart((prev) => new Map(prev).set(id, (prev.get(id) || 0) + 1));
  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const newCart = new Map(prev);
      const currentQty = newCart.get(id);
      if (currentQty && currentQty > 1) newCart.set(id, currentQty - 1);
      else newCart.delete(id);
      return newCart;
    });
  };
  const getCartItems = (): CartItem[] =>
    Array.from(cart.entries()).map(([id, quantity]) => ({
      ...menuItems.find((item) => item.id === id)!,
      quantity,
    }));
  const total = getCartItems().reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (isMenuLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading Menu...</div>;
  }
  if (isMenuError) {
    return <div className="flex justify-center items-center min-h-screen">Error fetching data.</div>;
  }

  return (
    <div className="min-h-screen" style={{ background: "#f9f5f5" }}>
      <LoginPromptModal isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
      <header className="sticky top-0 z-40 bg-[#f9f5f5]/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4">
          {isSearchVisible ? (
            <div className="flex items-center gap-2 w-full">
              <Search className="h-5 w-5 text-gray-400 shrink-0" />
              <input type="text" placeholder="ምግብ ፈልግ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus className="w-full bg-transparent focus:outline-none" />
              <button onClick={() => { setIsSearchVisible(false); setSearchQuery(""); }} className="text-sm font-semibold" style={{ color: "#db1020" }}>Cancel</button>
            </div>
          ) : (
            <>
              <button onClick={onBackAction} className="text-2xl font-bold transition-transform hover:scale-105" style={{ color: "#db1020" }}>←</button>
              <h1 className="text-xl font-bold" style={{ color: "#27742d" }}>Menu</h1>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsSearchVisible(true)} className="p-2"><Search className="h-5 w-5 text-gray-600" /></button>
                <button onClick={() => dispatch(toggleViewMode())} className="p-2">{viewMode === "grid" ? <List className="h-5 w-5 text-gray-600" /> : <LayoutGrid className="h-5 w-5 text-gray-600" />}</button>
                <button onClick={() => setShowCart(!showCart)} className="relative p-2">
                  <span className="font-bold">🛒</span>
                  {cart.size > 0 && (<span className="absolute top-0 right-0 block h-4 w-4 rounded-full text-xs text-white text-center" style={{ background: "#db1020", transform: "translate(25%, -25%)" }}>{cart.size}</span>)}
                </button>
              </div>
            </>
          )}
        </div>
      </header>
      <div className="sticky top-16 z-30 bg-linear-to-b from-[#f9f5f5] via-[#f9f5f5] to-transparent">
        <div className="flex gap-3 overflow-x-auto p-4 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button key={cat.key} onClick={() => handleCategorySelect(cat.key)} disabled={cat.key === 'favorites' && isFavoritesLoading} className="px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: selectedCategory === cat.key ? "#db1020" : "white", color: selectedCategory === cat.key ? "white" : "#27742d", border: `2px solid ${selectedCategory === cat.key ? "#db1020" : "rgba(39, 116, 45, 0.2)"}`, boxShadow: `0 2px 8px ${selectedCategory === cat.key ? "rgba(219, 16, 32, 0.2)" : "rgba(0,0,0,0.05)"}` }}>
              <span className="mr-2">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      <main className="px-4 pb-48">
        {filteredItems.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <MenuCard key={item.id} item={item} isInCart={cart.has(item.id)} quantity={cart.get(item.id) || 0} isFavorite={favoritesSet.has(item.id)} onAdd={() => addToCart(item.id)} onRemove={() => removeFromCart(item.id)} onToggleFavorite={handleToggleFavorite} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <MenuTableRow key={item.id} item={item} isInCart={cart.has(item.id)} quantity={cart.get(item.id) || 0} isFavorite={favoritesSet.has(item.id)} onAdd={() => addToCart(item.id)} onRemove={() => removeFromCart(item.id)} onToggleFavorite={handleToggleFavorite} />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🍽️</p>
            <h3 className="text-2xl font-bold text-gray-700">No Dishes Found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or category filters.</p>
          </div>
        )}
      </main>
      {showCart && cart.size > 0 && (
        <CartPreview
          items={getCartItems()}
          total={total}
          onCheckout={handleCheckout}
          isPlacingOrder={placeOrderMutation.isPending}
        />
      )}
    </div>
  );
}
