"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

export interface PublishedMenu {
  id: string
  date: string
  foodIds: string[]
  name: string
  day: string
  createdAt: string
}

interface APIMenuItem {
  id: string
  dailyMenuId: string
  foodId: string
  food: {
    id: string
    name: string
    price: number
    category: string
    imageUrl: string
    createdAt: string
  }
}

interface APIMenu {
  id: string
  date: string
  name: string
  day: string
  createdAt: string
  items: APIMenuItem[]
}

export function usePublishedMenus() {
  const { data, error, isLoading, refetch } = useQuery<{ menus: PublishedMenu[] }>({
    queryKey: ["published-menus"],
    queryFn: async () => {
      const res = await fetch("/api/menus/latest_menu")
      const rawData = await res.json()
      
      // Extract foodIds from items array and map to PublishedMenu format
      const transformedMenus: PublishedMenu[] = rawData.menus.map((menu: APIMenu) => ({
        id: menu.id,
        date: menu.date,
        foodIds: menu.items.map((item: APIMenuItem) => item.foodId),
        name: menu.name,
        day: menu.day,
        createdAt: menu.createdAt,
      }))
      
      return { menus: transformedMenus }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  return {
    menus: data?.menus || [],
    isLoading,
    error,
    mutate: refetch,
  }
}
