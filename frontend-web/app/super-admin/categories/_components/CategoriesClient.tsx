'use client';

import { useState, useEffect } from "react";
import { categoriesApi } from "@/lib/api/categories";
import type { Category } from "@/lib/types/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Folder, Search, Pencil, Trash2, RefreshCw, Plus } from "lucide-react";
import { CategoryDialog } from "./CategoryDialog";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { getIconByName } from "@/lib/utils/iconMapping";

interface CategoriesClientProps {
  triggerAddCategory?: number;
}

export function CategoriesClient({ triggerAddCategory }: CategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [categoryDialog, setCategoryDialog] = useState<{
    open: boolean;
    category?: Category;
  }>({ open: false });
  
  const [deleteCategoryDialog, setDeleteCategoryDialog] = useState<{
    open: boolean;
    category?: Category;
  }>({ open: false });
  
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (triggerAddCategory && triggerAddCategory > 0) {
      handleAddCategory();
    }
  }, [triggerAddCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getAll({ per_page: 100 });
      setCategories(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Gagal memuat data kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setCategoryDialog({ open: true });
  };

  const handleEditCategory = (category: Category) => {
    setCategoryDialog({ open: true, category });
  };

  const handleDeleteCategory = (category: Category) => {
    setDeleteCategoryDialog({ open: true, category });
  };

  const handleCloseDialog = () => {
    setCategoryDialog({ open: false, category: undefined });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteCategoryDialog({ open: false, category: undefined });
  };

  const handleSuccess = () => {
    fetchCategories();
    handleCloseDialog();
  };

  const handleConfirmDelete = async () => {
    if (!deleteCategoryDialog.category) return;

    try {
      setIsDeleting(true);
      await categoriesApi.delete(deleteCategoryDialog.category.id);
      toast.success("Kategori berhasil dihapus");
      fetchCategories();
      handleCloseDeleteDialog();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      const errorMessage = error.response?.data?.message || "Gagal menghapus kategori";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = categories.filter(c => c.is_active).length;
  const inactiveCount = categories.filter(c => !c.is_active).length;

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kategori</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Semua kategori
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategori Aktif</CardTitle>
            <Folder className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ditampilkan di sistem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategori Nonaktif</CardTitle>
            <Folder className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tidak ditampilkan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Root Categories</CardTitle>
            <Folder className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.filter(c => !c.parent_id).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Kategori utama
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
          <CardDescription>
            Menampilkan {filteredCategories.length} dari {categories.length} kategori
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Cari kategori berdasarkan nama, slug, atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchCategories}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'Kategori tidak ditemukan' : 'Belum ada kategori'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Coba ubah kata kunci pencarian Anda' 
                  : 'Mulai dengan menambahkan kategori pertama'}
              </p>
              {!searchQuery && (
                <Button onClick={handleAddCategory}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Kategori Pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {category.icon ? (
                            (() => {
                              const IconComponent = getIconByName(category.icon);
                              return <IconComponent className="h-4 w-4 text-emerald-600" />;
                            })()
                          ) : (
                            <Folder className="h-4 w-4 text-emerald-600" />
                          )}
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {category.slug}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {category.description || '-'}
                      </TableCell>
                      <TableCell>
                        {category.parent ? (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            {category.parent.icon ? (
                              (() => {
                                const IconComponent = getIconByName(category.parent.icon);
                                return <IconComponent className="h-3 w-3" />;
                              })()
                            ) : (
                              <Folder className="h-3 w-3" />
                            )}
                            {category.parent.name}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.is_active ? "default" : "secondary"}>
                          {category.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCategory(category)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CategoryDialog
        open={categoryDialog.open}
        category={categoryDialog.category}
        categories={categories}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
      />

      <DeleteConfirmation
        open={deleteCategoryDialog.open}
        onOpenChange={(open) => {
          if (!open) handleCloseDeleteDialog();
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Kategori"
        description={deleteCategoryDialog.category ? `Apakah Anda yakin ingin menghapus kategori "${deleteCategoryDialog.category.name}"? Tindakan ini tidak dapat dibatalkan.` : "Tindakan ini tidak dapat dibatalkan."}
        isLoading={isDeleting}
      />
    </>
  );
}
