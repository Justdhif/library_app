"use client";

import { useState } from "react";
import { categoriesApi } from "@/lib/api/categories";
import type { Category } from "@/lib/types/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface DeleteCategoryDialogProps {
  open: boolean;
  category?: Category;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteCategoryDialog({ open, category, onClose, onSuccess }: DeleteCategoryDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirmDelete = async () => {
    if (!category) return;

    try {
      setLoading(true);
      await categoriesApi.delete(category.id);
      toast.success("Kategori berhasil dihapus");
      onSuccess();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      const errorMessage = error.response?.data?.message || "Gagal menghapus kategori";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus kategori ini?
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {category && (
          <div className="my-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">
                  {category.name}
                </p>
                {category.description && (
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
                <p className="text-sm text-destructive mt-2">
                  Tindakan ini tidak dapat dibatalkan. Semua sub-kategori dan relasi dengan buku akan terpengaruh.
                </p>
              </div>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Menghapus...
              </>
            ) : (
              'Hapus'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
