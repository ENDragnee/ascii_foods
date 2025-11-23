"use client";

import { BellRing, X } from 'lucide-react';

interface NotificationToastProps {
  show: boolean;
  title: string;
  body: string;
  onClose: () => void;
}

export default function NotificationToast({ show, title, body, onClose }: NotificationToastProps) {
  if (!show) return null;

  return (
    // Position fixed at top, responsive margins
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-center md:left-auto md:justify-end">
      <div
        className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-xl ring-1 ring-black/5 animate-in slide-in-from-top-5 fade-in duration-300"
        role="alert"
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 pt-0.5">
              <BellRing className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>

            {/* Content */}
            <div className="ml-1 w-0 flex-1">
              <p className="text-sm font-bold text-foreground">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {body}
              </p>
            </div>

            {/* Close Button */}
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                className="inline-flex rounded-md bg-card text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Optional: Progress bar or accent line at bottom */}
        <div className="h-1 w-full bg-muted">
          <div className="h-full w-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}
