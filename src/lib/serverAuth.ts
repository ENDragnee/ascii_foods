// lib/serverAuth.ts
import { headers } from "next/headers";
import { auth } from "./auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
    const session = await auth.api.getSession({ headers: await headers() });
  

  if (!session) {
    redirect("/auth?view=signin");
  }

  return session;
}