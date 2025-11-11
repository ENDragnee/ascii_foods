// /hooks/useSession.ts
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

/**
 * A client-side hook to get the current user session.
 * @param initialSession The session passed from a server component.
 * @returns The session object AND a boolean indicating if the session is being validated.
 */
export const useSession = (initialSession: Session | null) => {
  const { data, isLoading, isError } = useQuery<SessionResponse>({
    queryKey: ["session"],
    queryFn: fetchSession,
    initialData: { session: initialSession },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  // Expose the isLoading state so our component knows when the session is being checked.
  return { session: data?.session, isLoading, isError };
};
