"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useAdminMenu } from "@/hooks/use-admin"
import { usePublishedMenus } from "@/hooks/use-published-menus"
import { setMenuForDate, clearAllMenus } from "@/store/slices/menuSlice"
import type { RootState, AppDispatch } from "@/store"

export interface MenuItemData {
  date: string
  foodIds: string[]
  name: string
  day: string
}

export default function useMenuPublish() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isPublished, setIsPublished] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [menuMode, setMenuMode] = useState<"daily" | "future">("daily")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  const { data: availableMenuItems = [] } = useAdminMenu()
  const { menus: publishedMenus, mutate: refetchPublishedMenus } = usePublishedMenus()
  
  const dispatch = useDispatch<AppDispatch>()
  const storedMenus = useSelector((state: RootState) => state.menu.menus)

  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setSelectedDate(newDate)

    const dateKey = newDate.toISOString().split('T')[0]
    
    // First check Redux state for unsaved menus
    const existingMenu = storedMenus.find((menu) => menu.date === dateKey)
    if (existingMenu) {
      setSelectedItems(existingMenu.foodIds)
    } else {
      // Then check published menus from API
      const publishedMenu = publishedMenus.find((menu) => {
        const menuDate = new Date(menu.date).toISOString().split('T')[0]
        return menuDate === dateKey
      })
      if (publishedMenu) {
        setSelectedItems(publishedMenu.foodIds)
      } else {
        setSelectedItems([])
      }
    }
  }
  
  const saveScheduledMenuToState = () => {
    const dateKey = selectedDate.toISOString().split('T')[0]
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' })

    dispatch(
      setMenuForDate({
        date: dateKey,
        foodIds: selectedItems,
        name: `Menu for ${selectedDate.toLocaleDateString()}`,
        day: dayName,
      })
    )

    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const publishMenu = async () => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    let menuToPublish: MenuItemData

    if (menuMode === "daily") {
      const today = new Date()
      const dateKey = today.toISOString().split('T')[0]

      menuToPublish = {
        date: dateKey,
        foodIds: selectedItems,
        name: "Today's Menu",
        day: dayNames[today.getDay()],
      }

      dispatch(setMenuForDate(menuToPublish))

      try {
        const res = await fetch("/api/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ menus: [menuToPublish] }),
        })
        if (!res.ok) throw new Error("Failed to publish menu")
        const data = await res.json()
        console.log("Menu published:", data[0])
        
        await refetchPublishedMenus()
        
        setIsPublished(true)
        setTimeout(() => setIsPublished(false), 3000)
      } catch (error) {
        console.error("Error publishing menu:", error)
      }
    } else {
      return
    }
  }

  const publishMultipleMenus = async () => {
    const menusToPublish = storedMenus.map((menu) => ({
      date: menu.date,
      foodIds: menu.foodIds,
      name: menu.name,
      day: menu.day,
    }))

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menus: menusToPublish }),
      })
      if (!res.ok) throw new Error("Failed to publish menus")
      const data = await res.json()
      console.log("Menus published:", data)
      
      dispatch(clearAllMenus())
      await refetchPublishedMenus()
      
      setIsPublished(true)
      setTimeout(() => setIsPublished(false), 3000)
    } catch (error) {
      console.error("Error publishing menus:", error)
    }
  }

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const hasMenuOnDate = (day: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateKey = date.toISOString().split('T')[0]
    
    // Check Redux state
    const hasReduxMenu = storedMenus.some((menu) => menu.date === dateKey && menu.foodIds.length > 0)
    
    // Check published menus
    const hasPublishedMenu = publishedMenus.some((menu) => {
      const menuDate = new Date(menu.date).toISOString().split('T')[0]
      return menuDate === dateKey && menu.foodIds.length > 0
    })
    
    return hasReduxMenu || hasPublishedMenu
  }

  const isSelectedDate = (day: number): boolean => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    )
  }

  const isToday = (day: number): boolean => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }

  const categories = [...new Set(availableMenuItems.map((item) => item.category))]
  const publishedItems = availableMenuItems.filter((item) => selectedItems.includes(item.id))

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
  ]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return {
    // state
    selectedItems,
    isPublished,
    showPreview,
    menuMode,
    selectedDate,
    currentMonth,
    availableMenuItems,
    storedMenus,
    // setters
    setMenuMode,
    setShowPreview,
    setSelectedDate,
    setCurrentMonth,
    setSelectedItems,
    // handlers
    toggleItem,
    handleDateClick,
    saveScheduledMenuToState,
    publishMenu,
    publishMultipleMenus,
    // helpers
    getDaysInMonth,
    getFirstDayOfMonth,
    hasMenuOnDate,
    isSelectedDate,
    isToday,
    categories,
    publishedItems,
    monthNames,
    dayNames,
  }
}
