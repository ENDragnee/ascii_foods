"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { LayoutGrid, List, Search, Loader2, AlertCircle, ShoppingCart, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import MenuCard from "./menu-card";
import CartPreview from "./cart-preview";
import { MenuTableRow } from "./menu-table-row";
import LoginPromptModal from "@/components/modals/login-prompt-modal";
import { PaginationControls } from "@/components/pagination-controls";
import { toggleViewMode } from "@/store/slices/viewModeSlice";
import { RootState } from "@/store";
import { MenuItem, CartItem } from "@/types";

const ITEMS_PER_PAGE = 9;

const CATEGORIES = [
  { key: "all", label: "All", emoji: "📋" },
  { key: "favorites", label: "Favorites", emoji: "⭐" },
  { key: "NORMAL", label: "Main", emoji: "🍽️" },
  { key: "SPECIAL", label: "Specialty", emoji: "✨" },
  { key: "HOTDRINK", label: "Hot Drinks", emoji: "☕" },
  { key: "JUICE", label: "Juice", emoji: "🍹" },
];

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

async function createOrder(items: CartItem[]) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) throw new Error("Failed to place order.");
  return response.json();
}

export default function MenuExperience() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const viewMode = useSelector((state: RootState) => state.viewMode.mode);
  const dispatch = useDispatch();

  // --- Component State ---
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  // ✅ FIX: State to control search bar visibility is restored
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // --- Data Fetching ---
  const { data: menuItems = [], isLoading: isMenuLoading, isError: isMenuError } = useQuery<MenuItem[]>({ queryKey: ["menus"], queryFn: fetchMenus });
  const { data: favoriteIds, isLoading: isFavoritesLoading } = useQuery<string[] | null>({ queryKey: ["favorites"], queryFn: fetchFavorites, staleTime: 5 * 60 * 1000 });

  const isAuthenticated = favoriteIds !== null && favoriteIds !== undefined;
  const favoritesSet = useMemo(() => new Set(favoriteIds || []), [favoriteIds]);


  const routeToSignIn = () => {
    router.push("/auth?view=signin")
  }

  // --- Mutations ---
  const toggleFavoriteMutation = useMutation({
    mutationFn: toggleFavorite,
    onMutate: async (foodId: string) => {
      await queryClient.cancelQueries({ queryKey: ["favorites"] });
      const previousFavorites = queryClient.getQueryData<string[] | null>(["favorites"]);
      if (!previousFavorites) return { previousFavorites: [] };
      const newFavorites = favoritesSet.has(foodId) ? previousFavorites.filter((id) => id !== foodId) : [...previousFavorites, foodId];
      queryClient.setQueryData(["favorites"], newFavorites);
      return { previousFavorites };
    },
    onError: (err, _foodId, context) => {
      if (context?.previousFavorites !== undefined) queryClient.setQueryData(["favorites"], context.previousFavorites);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      setCart(new Map());
      setShowCart(false);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      router.push('/orders');
    },
    onError: (error) => {
      console.error("Order failed:", error);
      alert("There was an error placing your order. Please try again.");
    },
  });

  // --- Event Handlers ---
  const handleToggleFavorite = (foodId: string) => {
    if (!isAuthenticated) setShowLoginPrompt(true);
    else toggleFavoriteMutation.mutate(foodId);
  };

  const handleCategorySelect = (categoryKey: string) => {
    setCurrentPage(1);
    setSearchQuery(""); // Also clear search on category change
    if (categoryKey === "favorites") {
      if (isFavoritesLoading) return;
      if (!isAuthenticated) setShowLoginPrompt(true);
      else setSelectedCategory("favorites");
    } else {
      setSelectedCategory(categoryKey);
    }
  };

  const handleCheckout = () => {
    const cartItems = getCartItems();
    if (cartItems.length > 0) placeOrderMutation.mutate(cartItems);
  };

  // ✅ FIX: Event handler for search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when user types
  };

  // --- Filtering & Pagination ---
  const filteredItems = useMemo(() => {
    let items: MenuItem[] = menuItems;
    if (selectedCategory === "favorites") items = items.filter((item) => favoritesSet.has(item.id));
    else if (selectedCategory !== "all") items = items.filter((item) => item.category.toUpperCase() === selectedCategory.toUpperCase());
    if (searchQuery.trim() !== "") items = items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return items;
  }, [selectedCategory, searchQuery, menuItems, favoritesSet]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

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
  const getCartItems = (): CartItem[] => Array.from(cart.entries()).map(([id, quantity]) => ({ ...menuItems.find((item) => item.id === id)!, quantity }));
  const total = getCartItems().reduce((sum, item) => sum + item.price * item.quantity, 0);

  // --- Render Logic ---
  if (isMenuLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-muted-foreground" /></div>;
  }
  if (isMenuError) {
    return <div className="flex h-full w-full flex-col items-center justify-center text-destructive"><AlertCircle className="h-12 w-12" /><p className="mt-4 text-lg">Could not load menu.</p></div>;
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <LoginPromptModal isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />

      <header className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-4">
          {/* ✅ FIX: Conditional rendering for the search bar */}
          {isSearchVisible ? (
            <div className="flex w-full items-center gap-2">
              <Search className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for a dish..."
                value={searchQuery}
                onChange={handleSearchChange}
                autoFocus
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <Button variant="ghost" size="sm" onClick={() => { setIsSearchVisible(false); setSearchQuery(""); }}>
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-foreground">Menu</h1>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => setIsSearchVisible(true)}>
                  <Search className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => dispatch(toggleViewMode())}>
                  {viewMode === 'grid' ? <List className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon" className="relative" onClick={() => setShowCart(true)}>
                  <ShoppingCart className="h-5 w-5" />
                  {cart.size > 0 && (<span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{cart.size}</span>)}
                </Button>
              </div>
            </>
          )}
        </div>
      </header>

      <div className="flex-shrink-0 border-b border-border bg-card/50">
        <div className="flex gap-2 overflow-x-auto p-3 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleCategorySelect(cat.key)}
              disabled={cat.key === 'favorites' && isFavoritesLoading}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 disabled:opacity-50 ${selectedCategory === cat.key ? 'bg-primary text-primary-foreground shadow' : 'bg-card text-foreground hover:bg-muted'
                }`}
            >
              <span className="mr-2">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4">
        {paginatedItems.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedItems.map((item) => <MenuCard key={item.id} item={item} isInCart={cart.has(item.id)} quantity={cart.get(item.id) || 0} isFavorite={favoritesSet.has(item.id)} onAdd={() => addToCart(item.id)} onRemove={() => removeFromCart(item.id)} onToggleFavorite={handleToggleFavorite} />)}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedItems.map((item) => <MenuTableRow key={item.id} item={item} isInCart={cart.has(item.id)} quantity={cart.get(item.id) || 0} isFavorite={favoritesSet.has(item.id)} onAdd={() => addToCart(item.id)} onRemove={() => removeFromCart(item.id)} onToggleFavorite={handleToggleFavorite} />)}
            </div>
          )
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="mb-4 text-4xl">🍽️</p>
            <h3 className="text-2xl font-bold text-foreground">
              {searchQuery ? "No Dishes Found" : "This Category is Empty"}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {searchQuery ? "Try a different search term." : "Please select another category."}
            </p>
          </div>
        )}
      </main>

      <footer className="flex-shrink-0 border-t border-border bg-card">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </footer>

      {showCart && cart.size > 0 && (
        <CartPreview
          items={getCartItems()}
          total={total}
          onCheckout={handleCheckout}
          isPlacingOrder={placeOrderMutation.isPending}
          isAuthenticated={isAuthenticated}
          routeToSignIn={routeToSignIn}
          onClose={() => setShowCart(false)}
        />
      )
      }
    </div>
  );
}
