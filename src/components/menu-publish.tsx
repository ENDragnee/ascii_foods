"use client";

import {
  Check,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Save,
  Calendar as CalendarIcon,
  Zap,
  RotateCcw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import useMenuPublish from "@/hooks/use-publish";
import Image from 'next/image';
import { cn } from "@/lib/utils"; // Ensure you have a utility for class merging

export default function MenuPublish() {
  const {
    // State & Data
    selectedItems,
    setSelectedItems,
    isPublished,
    showPreview,
    menuMode,
    selectedDate,
    currentMonth,
    availableMenuItems,
    storedMenus,
    categories,
    publishedItems,
    previousMenus, // From the updated hook

    // Actions
    setMenuMode,
    setShowPreview,
    setSelectedDate,
    setCurrentMonth,
    toggleItem,
    handleDateClick,
    saveScheduledMenuToState,
    publishMenu,
    publishMultipleMenus,
    loadMenu, // From the updated hook

    // Helpers
    getDaysInMonth,
    getFirstDayOfMonth,
    hasMenuOnDate,
    isSelectedDate,
    isToday,
    monthNames,
    dayNames,
  } = useMenuPublish();

  return (
    <main className="flex h-full flex-col overflow-hidden bg-background">
      {/* --- Top Header Bar --- */}
      <div className="flex flex-col justify-between gap-4 border-b border-border bg-card p-4 sm:flex-row sm:items-center md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {menuMode === "daily" ? "Daily Menu" : "Schedule Menu"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {menuMode === "daily"
              ? "Select items to publish for today."
              : "Plan menus for upcoming dates."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Load Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 border-border">
                <Zap className="h-4 w-4 text-secondary" />
                <span className="hidden sm:inline">Quick Load</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Recent Menus</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {previousMenus.length === 0 ? (
                <div className="p-2 text-xs text-muted-foreground">No recent menus found.</div>
              ) : (
                previousMenus.map((menu) => (
                  <DropdownMenuItem key={menu.id} onClick={() => loadMenu(menu.items)}>
                    <span>{menu.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{menu.items.length} items</span>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedItems([])} className="text-destructive">
                <RotateCcw className="mr-2 h-3 w-3" />
                Clear Selection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mode Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                {menuMode === "daily" ? "Today" : "Calendar"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => { setMenuMode("daily"); setSelectedDate(new Date()); }}>
                {menuMode === "daily" && <Check className="mr-2 h-4 w-4" />}
                Daily Menu
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMenuMode("future")}>
                {menuMode === "future" && <Check className="mr-2 h-4 w-4" />}
                Future Schedule
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* --- Success Message --- */}
      {isPublished && (
        <div className="animate-in fade-in slide-in-from-top-2 bg-green-500/10 px-6 py-2 text-center text-sm font-medium text-green-600 border-b border-green-500/20">
          Menu published successfully!
        </div>
      )}

      {/* --- Main Workspace (Grid) --- */}
      <div className="flex flex-1 overflow-hidden">
        <div className="grid w-full grid-cols-1 lg:grid-cols-3">

          {/* LEFT: Food Selection Tabs */}
          <div className="flex h-full flex-col overflow-hidden border-r border-border bg-background lg:col-span-2">
            <Tabs defaultValue={categories[0]} className="flex h-full flex-col">
              {/* Scrollable Tab List */}
              <div className="border-b border-border bg-card px-4">
                <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0 py-2 no-scrollbar">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="rounded-full border border-border bg-background px-4 py-1.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Tab Content (Food Grid) */}
              <div className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6">
                {categories.map((category) => (
                  <TabsContent key={category} value={category} className="m-0">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {availableMenuItems
                        .filter((item) => item.category === category)
                        .map((item) => {
                          const isSelected = selectedItems.includes(item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => toggleItem(item.id)}
                              className={cn(
                                "group relative flex cursor-pointer items-center gap-3 rounded-xl border p-3 shadow-sm transition-all duration-200 hover:shadow-md",
                                isSelected
                                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                                  : "border-border bg-card hover:border-primary/50"
                              )}
                            >
                              {/* Checkbox Indicator */}
                              <div className={cn(
                                "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground/30 bg-background group-hover:border-primary/50"
                              )}>
                                {isSelected && <Check className="h-3 w-3" />}
                              </div>

                              {/* Image */}
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                                {item.imageUrl ? (
                                  <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-2xl">🍽️</div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0 pr-6">
                                <p className="truncate font-semibold text-foreground">{item.name}</p>
                                <p className="text-sm font-bold text-primary">{item.price.toFixed(2)}</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>

          {/* RIGHT: Sidebar (Calendar & Actions) */}
          <div className="flex h-full flex-col overflow-y-auto border-t border-border bg-card lg:border-l lg:border-t-0">
            <div className="space-y-6 p-4 md:p-6">

              {/* Calendar (Future Mode Only) */}
              {menuMode === "future" && (
                <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-muted-foreground mb-2">
                    {dayNames.map((day) => <div key={day}>{day.slice(0, 3)}</div>)}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}
                    {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                      const day = i + 1;
                      const isSelected = isSelectedDate(day);
                      const hasMenu = hasMenuOnDate(day);
                      const isCurrent = isToday(day);

                      return (
                        <button
                          key={day}
                          onClick={() => handleDateClick(day)}
                          className={cn(
                            "relative flex aspect-square flex-col items-center justify-center rounded-md text-sm transition-all",
                            isSelected ? "bg-primary text-primary-foreground font-bold shadow-md" :
                              hasMenu ? "bg-secondary/20 text-secondary-foreground ring-1 ring-inset ring-secondary font-medium" :
                                isCurrent ? "bg-muted font-bold text-foreground ring-1 ring-inset ring-border" :
                                  "hover:bg-muted text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {day}
                          {hasMenu && !isSelected && (
                            <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-secondary" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                    <CalendarIcon className="h-3 w-3" />
                    Editing: <span className="font-medium text-foreground">{selectedDate.toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              {/* Summary & Actions */}
              <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Publishing</h3>

                <div className="mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Items Selected</span>
                    <span className="font-mono font-bold text-primary">{selectedItems.length}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${Math.min((selectedItems.length / (availableMenuItems.length || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {menuMode === "daily" ? (
                    <Button
                      onClick={publishMenu}
                      disabled={selectedItems.length === 0}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                      size="lg"
                    >
                      Publish Today&apos;s Menu
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={saveScheduledMenuToState}
                        disabled={selectedItems.length === 0}
                        variant="outline"
                        className="w-full border-primary/20 hover:bg-primary/5 hover:text-primary"
                      >
                        <Save className="mr-2 h-4 w-4" /> Save to {selectedDate.getDate()}
                      </Button>
                      <Button
                        onClick={publishMultipleMenus}
                        disabled={storedMenus.length === 0}
                        className="w-full bg-green-600 text-white hover:bg-green-700"
                      >
                        Publish All ({storedMenus.length}) Changes
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Preview Toggle */}
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="ghost"
                className="w-full justify-between text-muted-foreground hover:text-foreground"
              >
                <span>Customer View</span>
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>

              {/* Live Preview List */}
              {showPreview && (
                <div className="flex flex-col rounded-xl border border-border bg-background shadow-sm animate-in fade-in slide-in-from-top-2">
                  <div className="border-b border-border bg-muted/30 p-3">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">Preview</h3>
                  </div>
                  <ScrollArea className="h-64">
                    <div className="p-3 space-y-2">
                      {publishedItems.length === 0 ? (
                        <p className="py-8 text-center text-xs text-muted-foreground">No items selected.</p>
                      ) : (
                        publishedItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between rounded-md border border-border bg-card p-2 shadow-sm">
                            <span className="text-sm font-medium text-foreground">{item.name}</span>
                            <span className="text-sm font-bold text-primary">{item.price.toFixed(0)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
