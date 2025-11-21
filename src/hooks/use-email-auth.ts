import { signIn } from "@/lib/actions/auth-actions";
import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useEmailAuth() {
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const queryClient = useQueryClient();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const formEmail = formData.get("email") as string;
    const formPassword = formData.get("password") as string;

    try {
      const result = await signIn(formEmail, formPassword);

      if (!result.user) {
        setError("Invalid email or password");
        return false;
      }

      // ✅ Invalidate the "session" query so useSession will get fresh user data
      await queryClient.invalidateQueries({ queryKey: ["session"] });

      return true;
    } catch (err) {
      setError(
        `Authentication error: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleEmailAuth,
    error,
    isLoading,
  };
}
