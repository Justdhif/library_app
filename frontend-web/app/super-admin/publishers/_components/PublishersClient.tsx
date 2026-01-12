"use client";

import { useState, useEffect } from "react";
import { publishersApi } from "@/lib/api/publishers";
import type { Publisher } from "@/lib/types/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { EmptyState, SearchBar, Pagination } from '@/components/custom-ui';
import { PublishersTable } from "./PublishersTable";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";

export function PublishersClient() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    publisher: Publisher | null;
  }>({
    isOpen: false,
    publisher: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const perPage = 10;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch publishers when page or debounced search changes
  useEffect(() => {
    fetchPublishers();
  }, [page, debouncedSearchQuery]);

  const fetchPublishers = async () => {
    try {
      setLoading(true);
      const response = await publishersApi.getAll({
        page,
        per_page: perPage,
        search: debouncedSearchQuery || undefined,
      });
      
      setPublishers(Array.isArray(response.data) ? response.data : []);
      setTotal(response.total || 0);
    } catch (error: any) {
      toast.error("Gagal memuat data publishers", {
        description: error.response?.data?.message || "Terjadi kesalahan",
      });
      setPublishers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteDialog.publisher) return;

    try {
      setIsDeleting(true);
      await publishersApi.delete(deleteDialog.publisher.id);
      toast.success("Publisher berhasil dihapus", {
        description: `"${deleteDialog.publisher.name}" telah dihapus dari sistem`,
      });
      setDeleteDialog({ isOpen: false, publisher: null });
      
      // If deleting the last item on a page that's not page 1, go back one page
      if (publishers.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchPublishers();
      }
    } catch (error: any) {
      toast.error("Gagal menghapus publisher", {
        description: error.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (publisher: Publisher) => {
    setDeleteDialog({ isOpen: true, publisher });
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Publishers</CardTitle>
          <CardDescription>
            Kelola dan pantau data publisher buku
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onRefresh={fetchPublishers}
            placeholder="Cari nama publisher, email, atau website..."
          />

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 rounded-lg border bg-muted animate-pulse" />
              ))}
            </div>
          ) : publishers.length === 0 ? (
            <EmptyState
              icon={Building2}
              title={searchQuery ? "Tidak ada hasil" : "Belum ada publisher"}
              description={searchQuery ? "Coba ubah kata kunci pencarian Anda" : "Mulai tambahkan publisher ke perpustakaan"}
            />
          ) : (
            <>
              <PublishersTable
                publishers={publishers}
                loading={loading}
                onDelete={openDeleteDialog}
              />
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                total={total}
                perPage={perPage}
                onPageChange={setPage}
                itemLabel="publisher"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialog({ isOpen: false, publisher: null });
          }
        }}
        onConfirm={handleDelete}
        title="Hapus Publisher"
        description={
          deleteDialog.publisher
            ? `Apakah Anda yakin ingin menghapus publisher "${deleteDialog.publisher.name}"? Tindakan ini tidak dapat dibatalkan.`
            : ""
        }
        isLoading={isDeleting}
      />
    </>
  );
}
