"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { LayoutGrid, List, Search, Loader2, AlertCircle, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import MenuCard from "./menu-card";
import { MenuTableRow } from "./menu-table-row";
import LoginPromptModal from "@/components/modals/login-prompt-modal";
import { PaginationControls } from "@/components/pagination-controls";
import { RootState } from "@/store";
import { MenuItem } from "@/types";
import { addItem, removeItem, showCart, selectCartSize } from "@/store/slices/cartSlice";
import { toggleViewMode } from "@/store/slices/viewModeSlice";
// ✅ NEW: Import the custom hook to get live session data on the client.
import { useSession } from "@/hooks/use-session";

const ITEMS_PER_PAGE = 6;

const CATEGORIES = [
  { key: "all", label: "All", emoji: "📋" },
  { key: "favorites", label: "Favorites", emoji: "⭐" },
  { key: "NORMAL", label: "Main", emoji: "🍽️" },
  { key: "SPECIAL", label: "Specialty", emoji: "✨" },
  { key: "HOTDRINK", label: "Hot Drinks", emoji: "☕" },
  { key: "JUICE", label: "Juice", emoji: "🍹" },
];

// --- API Fetcher Functions (remain unchanged) ---
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

export default function MenuExperience() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  // ✅ FIX: Use the hook to get the LIVE session state.
  // We pass `null` because this component is purely client-side and has no initial server prop.
  const { session } = useSession(null);
  const isAuthenticated = !!session?.user;

  // Read cart and view mode state from Redux
  const cartItemsMap = useSelector((state: RootState) => state.cart.items);
  const cartSize = useSelector(selectCartSize);
  const viewMode = useSelector((state: RootState) => state.viewMode.mode);

  // --- Component-local State ---
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // --- Data Fetching with React Query ---
  const { data: menuItems = [], isLoading: isMenuLoading, isError: isMenuError } = useQuery<MenuItem[]>({ queryKey: ["menus"], queryFn: fetchMenus });

  // This query now correctly enables/disables based on the LIVE session state.
  const { data: favoriteIds, isLoading: isFavoritesLoading } = useQuery<string[] | null>({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
    enabled: isAuthenticated, // Use the reactive isAuthenticated flag
  });

  const favoritesSet = useMemo(() => new Set(favoriteIds || []), [favoriteIds]);

  // --- Mutation for Toggling Favorites ---
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
    onError: (err, _foodId, context) => { if (context?.previousFavorites !== undefined) queryClient.setQueryData(["favorites"], context.previousFavorites); },
    onSettled: () => { queryClient.invalidateQueries({ queryKey: ["favorites"] }); },
  });

  // --- Event Handlers ---
  const handleToggleFavorite = (foodId: string) => {
    if (!isAuthenticated) setShowLoginPrompt(true);
    else toggleFavoriteMutation.mutate(foodId);
  };

  const handleCategorySelect = (categoryKey: string) => {
    setCurrentPage(1);
    setSearchQuery("");
    if (categoryKey === "favorites") {
      if (isFavoritesLoading && !isAuthenticated) return; // Prevent click while checking auth
      if (!isAuthenticated) setShowLoginPrompt(true);
      else setSelectedCategory("favorites");
    } else {
      setSelectedCategory(categoryKey);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // --- Filtering & Pagination Logic ---
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

  // --- Render Logic ---
  if (isMenuLoading) return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-muted-foreground" /></div>;
  if (isMenuError) return <div className="flex h-full w-full flex-col items-center justify-center text-destructive"><AlertCircle className="h-12 w-12" /><p className="mt-4 text-lg">Could not load menu.</p></div>;

  return (
    <div className="flex h-full flex-col bg-background">
      <LoginPromptModal isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />

      <header className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-4">
          {isSearchVisible ? (
            <div className="flex w-full items-center gap-2">
              <Search className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
              <input type="text" placeholder="Search for a dish..." value={searchQuery} onChange={handleSearchChange} autoFocus className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none" />
              <Button variant="ghost" size="sm" onClick={() => { setIsSearchVisible(false); setSearchQuery(""); }}>Cancel</Button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-foreground">Menu</h1>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => setIsSearchVisible(true)}><Search className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" onClick={() => dispatch(toggleViewMode())}>{viewMode === 'grid' ? <List className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}</Button>
                <Button variant="ghost" size="icon" className="relative" onClick={() => dispatch(showCart())}>
                  <ShoppingCart className="h-5 w-5" />
                  {cartSize > 0 && (<span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{cartSize}</span>)}
                </Button>
              </div>
            </>
          )}
        </div>
      </header>

      <div className="flex-shrink-0 border-b border-border bg-card/50">
        <div className="flex gap-2 overflow-x-auto p-3 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button key={cat.key} onClick={() => handleCategorySelect(cat.key)} disabled={cat.key === 'favorites' && isFavoritesLoading} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 disabled:opacity-50 ${selectedCategory === cat.key ? 'bg-primary text-primary-foreground shadow' : 'bg-card text-foreground hover:bg-muted'}`}>
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
              {paginatedItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  isInCart={!!cartItemsMap[item.id]}
                  quantity={cartItemsMap[item.id] || 0}
                  isFavorite={favoritesSet.has(item.id)}
                  onAdd={() => dispatch(addItem(item))}
                  onRemove={() => dispatch(removeItem(item))}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedItems.map((item) => (
                <MenuTableRow
                  key={item.id}
                  item={item}
                  isInCart={!!cartItemsMap[item.id]}
                  quantity={cartItemsMap[item.id] || 0}
                  isFavorite={favoritesSet.has(item.id)}
                  onAdd={() => dispatch(addItem(item))}
                  onRemove={() => dispatch(removeItem(item))}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="mb-4 text-4xl">🍽️</p>
            <h3 className="text-2xl font-bold text-foreground">{searchQuery ? "No Dishes Found" : "This Category is Empty"}</h3>
            <p className="mt-2 text-muted-foreground">{searchQuery ? "Try a different search term." : "Please select another category."}</p>
          </div>
        )}
      </main>

      <footer className="flex-shrink-0 border-t border-border bg-card">
        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </footer>
    </div>
  );
}
