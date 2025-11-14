import { MenuItem } from "@/types/index";

export async function fetchFoods(): Promise<MenuItem[]> {
  const response = await fetch("/api/menus");
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
}