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
    <div className="fixed top-5 right-5 z-50 w-full max-w-sm bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden animate-fade-in-right">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <BellRing className="h-6 w-6 text-green-500" aria-hidden="true" />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="mt-1 text-sm text-gray-500">{body}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
