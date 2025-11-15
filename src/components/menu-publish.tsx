"use client"
// ...existing code...
import { Check, Eye, EyeOff, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useMenuPublish from "@/hooks/use-publish"


export default function MenuPublish() {
  // moved all state & handlers into hook
  const {
    selectedItems,
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
  } = useMenuPublish()

    const hasMenuForSelectedDate = hasMenuOnDate(selectedDate.getDate())

  const isItemSelected = (itemId: string) => {
    if (menuMode === "daily" && hasMenuForSelectedDate) {
      return publishedItems.some((pi) => pi.id === itemId)
    }
    return selectedItems.includes(itemId)
  }

  return (
    <main className="min-h-screen p-8 bg-linear-to-br from-slate-50 via-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">{menuMode === "daily" ? "Daily" : "Future"} Menu Management</h1>
            <p className="text-slate-600">Select items to publish for customers</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-medium text-slate-700 transition-colors">
                Menu Management
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  setMenuMode("daily")
                  setSelectedDate(new Date())
                  // clear selection via hook setter
                }}
                className={menuMode === "daily" ? "bg-blue-50" : ""}
              >
                {menuMode === "daily" && <Check className="w-4 h-4 mr-2" />}
                Daily Menu
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setMenuMode("future")}
                className={menuMode === "future" ? "bg-blue-50" : ""}
              >
                {menuMode === "future" && <Check className="w-4 h-4 mr-2" />}
                Future Schedule
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isPublished && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Menu published successfully! Customers can now see your menu.
            </span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            {categories.map((category) => (
              <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">{category}</h2>
                <div className="space-y-3">
                  {availableMenuItems
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
                        style={{
                          borderColor: selectedItems.includes(item.id) ? "#2563eb" : "#e2e8f0",
                          backgroundColor: selectedItems.includes(item.id) ? "#eff6ff" : "white",
                        }}
                      >
                        <div className="shrink-0">
                          {selectedItems.includes(item.id) ? (
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-slate-300 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{item.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900">{item.price.toFixed(2)} BIRR</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {menuMode === "future" && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                  ))}
                  {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                    const day = i + 1
                    const isSelected = isSelectedDate(day)
                    const hasmenu = hasMenuOnDate(day)
                    const isCurrentDay = isToday(day)

                    return (
                      <button
                        key={day}
                        onClick={() => handleDateClick(day)}
                        className={`aspect-square rounded-lg text-sm font-medium transition-all relative ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-md"
                            : hasmenu
                            ? "bg-green-100 text-slate-900 border-2 border-green-500 hover:bg-green-200"
                            : isCurrentDay
                            ? "bg-slate-100 text-slate-900 border border-slate-300"
                            : "bg-slate-50 text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        {day}
                        {hasmenu && !isSelected && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-slate-700">
                    Selected: <span className="font-bold">{selectedDate.toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg transition-colors"
              >
                {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Menu Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Items Selected:</span>
                  <span className="font-bold text-slate-900">
                    {selectedItems.length}/{availableMenuItems.length}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(selectedItems.length / availableMenuItems.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {menuMode === "daily" ? (
                <button
                  onClick={publishMenu}
                  disabled={selectedItems.length === 0}
                  className="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Publish Today's Menu
                </button>
              ) : (
                <>
                  <button
                    onClick={saveScheduledMenuToState}
                    disabled={selectedItems.length === 0}
                    className="w-full py-3 px-4 mb-2 bg-linear-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Menu for Selected Date
                  </button>
                  <button
                    onClick={publishMultipleMenus}
                    disabled={storedMenus.length === 0}
                    className="w-full py-3 px-4 bg-linear-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Publish All Scheduled Menus ({storedMenus.length})
                  </button>
                </>
              )}
            </div>

            {showPreview && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Customer View</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {publishedItems.length === 0 ? (
                    <p className="text-slate-500 text-sm">No items selected for this menu</p>
                  ) : (
                    publishedItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.price.toFixed(2)} BIRR</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}