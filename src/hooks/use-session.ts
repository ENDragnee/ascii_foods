"use client";

import { useQuery } from "@tanstack/react-query";
import { Session } from "@/types";

interface SessionResponse {
  session: Session | null;
}

async function fetchSession(): Promise<SessionResponse> {
  const res = await fetch("/api/session", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch session");
  }
  return res.json();
}

export const useSession = (initialSession: Session | null) => {
  const { data, isLoading, isError } = useQuery<SessionResponse, Error>({
    queryKey: ["session"],
    queryFn: fetchSession,
    initialData: initialSession ? { session: initialSession } : undefined,
    staleTime: 5 * 60 * 1000, // 5 min
    refetchOnWindowFocus: true,
    refetchOnMount: initialSession ? false : "always",
  });

  return {
    session: data?.session ?? null,
    isLoading,
    isError,
  };
};
