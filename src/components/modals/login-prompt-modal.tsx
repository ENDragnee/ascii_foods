"use client";

import { useRouter } from "next/navigation";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPromptModal({ isOpen, onClose }: LoginPromptModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSignIn = () => {
    router.push("/auth?view=signin");
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Please Sign In</h2>
        <p className="text-gray-600 mb-6">
          You need to be logged in to save your favorite foods.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSignIn}
            className="w-full py-3 rounded-full font-bold text-lg text-white transition-all"
            style={{ background: "linear-gradient(135deg, #27742d 0%, #1f5c23 100%)" }}
          >
            Sign In
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full font-bold text-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
