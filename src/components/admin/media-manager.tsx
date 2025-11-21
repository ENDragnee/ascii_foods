"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload, Image as ImageIcon, HardDrive, Cloud } from "lucide-react";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils"; // Ensure you have this utility, or remove if not using shadcn utils

interface Media {
  id: string;
  url: string;
  filename: string;
  size: number;
}

interface MediaStats {
  usedBytes: number;
  quotaBytes: number;
  usagePercentage: number;
  files: Media[];
}

export function MediaManager({ onSelect }: { onSelect: (url: string) => void }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const { data: stats, isLoading } = useQuery<MediaStats>({
    queryKey: ["media"],
    queryFn: async () => (await fetch("/api/media")).json(),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/media", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      onSelect(data.url);
      setUploadError("");
    },
    onError: (err: Error) => setUploadError(err.message),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Simple drag and drop visual feedback
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      uploadMutation.mutate(e.dataTransfer.files[0]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg border border-border bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Storage Quota Card */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <HardDrive className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Storage</h4>
              <p className="text-xs text-muted-foreground">Backblaze B2</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-foreground">
              {stats ? ((stats.usedBytes / stats.quotaBytes) * 100).toFixed(1) : 0}%
            </span>
            <p className="text-xs text-muted-foreground">
              {formatBytes(stats?.usedBytes || 0)} of {formatBytes(stats?.quotaBytes || 0)}
            </p>
          </div>
        </div>
        <Progress value={stats?.usagePercentage || 0} className="h-2" />
      </div>

      {/* Upload Area */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 transition-all hover:border-primary/50 hover:bg-muted/50",
          isDragging && "border-primary bg-primary/5"
        )}
      >
        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
        />

        {uploadMutation.isPending ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-full bg-card p-4 shadow-sm ring-1 ring-border transition-transform group-hover:scale-110">
              <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">Click or Drag to Upload</p>
            <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP (Max 600KB)</p>
          </>
        )}

        {uploadError && (
          <p className="mt-4 rounded-md bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
            {uploadError}
          </p>
        )}
      </div>

      {/* Recent Files Gallery */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground flex items-center gap-2">
          <Cloud className="h-4 w-4" /> Recent Uploads
        </h3>

        {!stats?.files || stats.files.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card text-muted-foreground">
            <ImageIcon className="h-8 w-8 opacity-20 mb-2" />
            <p className="text-xs">No images found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {stats.files.map((file) => (
              <div
                key={file.id}
                onClick={() => onSelect(file.url)}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2"
              >
                <Image
                  src={file.url}
                  alt={file.filename}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-black/60 p-1.5 text-[10px] text-white backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0 truncate">
                  {file.filename}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
