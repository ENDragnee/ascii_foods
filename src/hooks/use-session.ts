"use client";

import { useQuery } from "@tanstack/react-query";
import { Session } from "@/types";

interface SessionResponse {
  session: Session | null;
}

async function fetchSession(): Promise<SessionResponse> {
  const res = await fetch("/api/session");
  if (!res.ok) {
    throw new Error("Failed to fetch session");
  }
  return res.json();
}

export const useSession = (initialSession: Session | null) => {
  const { data, isLoading, isError } = useQuery<SessionResponse>({
    queryKey: ["session"],
    queryFn: fetchSession,
    initialData: { session: initialSession },
    staleTime: 5 * 60 * 1000, // Session data is considered fresh for 5 minutes
    refetchOnWindowFocus: true, // Refreshes session when the user returns to the tab
  });

  return {
    session: data?.session,
    isLoading,
    isError,
  };
};
