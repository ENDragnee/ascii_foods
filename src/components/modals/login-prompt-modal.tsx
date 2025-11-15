"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // Assuming Shadcn UI for consistency

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPromptModal({ isOpen, onClose }: LoginPromptModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSignIn = () => {
    router.push("/auth?view=signin"); // Adjust this path if your sign-in route is different
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-lg border border-border bg-card p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-2xl font-bold text-foreground">Please Sign In</h2>
        <p className="mb-6 text-muted-foreground">
          You need to be logged in to use this feature.
        </p>
        <div className="flex flex-col gap-3">
          <Button size="lg" onClick={handleSignIn}>
            Sign In
          </Button>
          <Button size="lg" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
