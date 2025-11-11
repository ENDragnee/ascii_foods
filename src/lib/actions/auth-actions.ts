"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const signUp = async (email: string, password: string, name: string) => {
  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
      callbackURL: "/cart",
    },
  });

  return result;
};

export const signIn = async (email: string, password: string) => {
  const result = await auth.api.signInEmail({
    body: {
      email,
      password,
      callbackURL: "/cart",
    },
  });

  return result;
};

export const signInSocial = async (provider: "google" | "apple") => {
  const { url } = await auth.api.signInSocial({
    body: {
      provider,
      callbackURL: "/cart",
    },
  });

  if (url) {
    redirect(url);
  }
};

export const signOut = async () => {
  const result = await auth.api.signOut({ headers: await headers() });
  return result;
};
