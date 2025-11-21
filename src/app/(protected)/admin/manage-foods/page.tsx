"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, Save, Loader2, HardDrive, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MenuItem } from "@/types";
import { MediaManager } from "@/components/admin/media-manager";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";

// --- Interfaces ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface FoodFormData {
  name: string;
  price: string;
  category: string;
  imageUrl: string;
}

interface MediaStats {
  usedBytes: number;
  quotaBytes: number;
  usagePercentage: number;
}

// --- Helper Components ---

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        {children}
      </div>
    </div>
  );
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};


export default function ManageMenuPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<FoodFormData>({ name: "", price: "", category: "NORMAL", imageUrl: "" });
  const [showMediaManager, setShowMediaManager] = useState(false);

  // --- Queries ---
  const { data: foods, isLoading: isFoodsLoading } = useQuery<MenuItem[]>({
    queryKey: ["admin-foods-list"],
    queryFn: async () => (await fetch("/api/foods")).json(),
  });

  const { data: mediaStats } = useQuery<MediaStats>({
    queryKey: ["media-stats"],
    queryFn: async () => (await fetch("/api/media")).json(),
  });

  // --- Mutations ---
  const saveMutation = useMutation({
    mutationFn: async (data: FoodFormData) => {
      const method = editingFood ? "PATCH" : "POST";
      // Create a payload object that matches the API expectation
      const payload = editingFood ? { ...data, id: editingFood.id } : data;

      const res = await fetch("/api/foods", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-foods-list"] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/foods?id=${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-foods-list"] }),
  });

  // --- Handlers ---
  const resetForm = () => {
    setFormData({ name: "", price: "", category: "NORMAL", imageUrl: "" });
    setEditingFood(null);
    setShowMediaManager(false);
  };

  const handleEdit = (food: MenuItem) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      price: food.price.toString(),
      category: food.category,
      imageUrl: food.imageUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isFoodsLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <main className="h-full overflow-y-auto p-4 md:p-6 bg-background">
      <div className="space-y-6">

        {/* Header & Storage Stats */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Food Management</h1>
            <p className="text-muted-foreground">Add, edit, and organize your food items.</p>
          </div>

          {/* Storage Card */}
          <div className="w-full md:w-72 rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <HardDrive className="h-4 w-4 text-primary" />
                <span>Storage</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {mediaStats ? `${formatBytes(mediaStats.usedBytes)} / ${formatBytes(mediaStats.quotaBytes)}` : 'Loading...'}
              </span>
            </div>
            <Progress value={mediaStats?.usagePercentage || 0} className="h-2" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Add Food Item
          </Button>
        </div>

        {/* Food Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {foods?.map((food) => (
            <div key={food.id} className="group relative flex items-center gap-4 rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:border-primary/50">

              {/* Image */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {food.imageUrl ? (
                  <Image src={food.imageUrl} alt={food.name} layout="fill" objectFit="cover" className="transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl text-muted-foreground"><ImageIcon className="h-6 w-6" /></div>
                )}
              </div>

              {/* Info */}
              <div className="flex-grow min-w-0">
                <h3 className="font-bold text-foreground truncate">{food.name}</h3>
                <p className="text-sm font-medium text-primary">{food.price.toFixed(2)} ETB</p>
                <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground tracking-wide">
                  {food.category}
                </span>
              </div>

              {/* Actions (Hidden by default, shown on hover) */}
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10" onClick={() => handleEdit(food)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(food.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingFood ? "Edit Food" : "Add New Food"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Special Burger"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price (ETB)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="NORMAL">Main</option>
                <option value="SPECIAL">Specialty</option>
                <option value="HOTDRINK">Hot Drinks</option>
                <option value="JUICE">Juice</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image</Label>

            {/* Image Preview Area */}
            <div className="flex flex-col gap-3">
              {formData.imageUrl ? (
                <div className="relative h-40 w-full overflow-hidden rounded-md border border-border group">
                  <Image src={formData.imageUrl} alt="Preview" layout="fill" objectFit="cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button type="button" variant="secondary" size="sm" onClick={() => setShowMediaManager(true)}>Change Image</Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setShowMediaManager(true)}
                  className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:bg-muted hover:border-primary/50 transition-colors"
                >
                  <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Click to select image</span>
                </div>
              )}
            </div>

            {/* Media Manager Toggle */}
            {showMediaManager && (
              <div className="mt-4 rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold">Media Library</h3>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowMediaManager(false)}>Close</Button>
                </div>
                <MediaManager onSelect={(url) => {
                  setFormData({ ...formData, imageUrl: url });
                  setShowMediaManager(false);
                }} />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saveMutation.isPending} className="bg-primary text-primary-foreground">
              {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Item
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
