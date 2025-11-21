"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Upload,
  Trash2,
  HardDrive,
  Image as ImageIcon,
  Copy,
  Check,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PaginationControls } from "@/components/pagination-controls";

const PAGE_SIZE = 12; // Number of images per page

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  size: number;
  createdAt: string;
}

interface MediaResponse {
  usedBytes: number;
  quotaBytes: number;
  usagePercentage: number;
  totalFiles: number;
  totalPages: number;
  files: MediaItem[];
}

// Helper to format file sizes
const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function MediaPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Queries ---
  const { data, isLoading, isError } = useQuery<MediaResponse>({
    queryKey: ["admin-media", page],
    queryFn: async () => {
      const res = await fetch(`/api/media?page=${page}&limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error("Failed to fetch media");
      return res.json();
    },
  });

  // --- Mutations ---
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/media", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onMutate: () => setUploading(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      setUploading(false);
    },
    onError: () => {
      setUploading(false);
      alert("Failed to upload image. Ensure it is under 600KB.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/media?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    },
    onError: () => alert("Failed to delete image."),
  });

  // --- Handlers ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-muted-foreground" /></div>;
  if (isError) return <div className="flex h-full flex-col items-center justify-center text-destructive"><AlertCircle className="h-12 w-12" /><p className="mt-4">Failed to load media library.</p></div>;

  return (
    <main className="flex h-full flex-col overflow-hidden bg-background">
      {/* Header & Stats */}
      <header className="flex-shrink-0 border-b border-border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Media Library</h1>
            <p className="text-muted-foreground">Manage your images and storage.</p>
          </div>

          {/* Storage Card */}
          <div className="w-full rounded-lg border border-border bg-muted/30 p-3 md:w-72">
            <div className="mb-2 flex justify-between text-sm">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <HardDrive className="h-4 w-4 text-primary" />
                <span>Storage Usage</span>
              </div>
              <span className="text-muted-foreground">
                {formatBytes(data?.usedBytes || 0)} / {formatBytes(data?.quotaBytes || 0)}
              </span>
            </div>
            <Progress value={data?.usagePercentage || 0} className="h-2" />
          </div>
        </div>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">

        {/* Upload Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mb-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card p-8 transition-all hover:border-primary/50 hover:bg-muted/50"
        >
          <input type="file" hidden ref={fileInputRef} onChange={handleFileSelect} accept="image/*" />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <>
              <div className="mb-3 rounded-full bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Upload New Image</h3>
              <p className="text-sm text-muted-foreground">Click to browse (Max 600KB)</p>
            </>
          )}
        </div>

        {/* Image Grid */}
        {data?.files.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-10 w-10 opacity-20 mb-2" />
            <p>No images found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {data?.files.map((file) => (
              <div key={file.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <Image
                  src={file.url}
                  alt={file.filename}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay Actions */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div className="p-3">
                    <p className="mb-1 truncate text-[10px] text-white/70">{file.filename}</p>
                    <p className="mb-3 text-[10px] font-medium text-white">{formatBytes(file.size)}</p>

                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7 bg-white/20 text-white hover:bg-white/40 backdrop-blur-md"
                        onClick={(e) => { e.stopPropagation(); handleCopyUrl(file.id, file.url); }}
                        title="Copy Link"
                      >
                        {copiedId === file.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); if (confirm('Delete this image?')) deleteMutation.mutate(file.id); }}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Pagination */}
      <footer className="flex-shrink-0 border-t border-border bg-card p-2">
        <PaginationControls
          currentPage={page}
          totalPages={data?.totalPages || 1}
          onPageChange={setPage}
        />
      </footer>
    </main>
  );
}
