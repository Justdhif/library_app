'use client';

import { useState, useEffect } from "react";
import { authorsApi } from "@/lib/api/authors";
import type { Author } from "@/lib/types/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UserCircle } from "lucide-react";
import { AuthorDialog } from "./AuthorDialog";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { EmptyState, SearchBar, Pagination } from '@/components/custom-ui';
import { AuthorsTable } from "./AuthorsTable";

interface AuthorsClientProps {
  triggerAddAuthor?: number;
}

export function AuthorsClient({ triggerAddAuthor }: AuthorsClientProps) {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 10;
  
  const [authorDialog, setAuthorDialog] = useState<{
    open: boolean;
    author?: Author;
  }>({ open: false });
  
  const [deleteAuthorDialog, setDeleteAuthorDialog] = useState<{
    open: boolean;
    author?: Author;
  }>({ open: false });
  
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch authors when page or debounced search changes
  useEffect(() => {
    fetchAuthors();
  }, [page, debouncedSearchQuery]);

  useEffect(() => {
    if (triggerAddAuthor && triggerAddAuthor > 0) {
      handleAddAuthor();
    }
  }, [triggerAddAuthor]);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const response = await authorsApi.getAll({ 
        page,
        per_page: perPage,
        search: debouncedSearchQuery || undefined,
      });
      
      setAuthors(Array.isArray(response.data) ? response.data : []);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('Error fetching authors:', error);
      toast.error('Gagal memuat data penulis', {
        description: error.response?.data?.message || 'Terjadi kesalahan',
      });
      setAuthors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleAddAuthor = () => {
    setAuthorDialog({ open: true });
  };

  const handleEditAuthor = (author: Author) => {
    setAuthorDialog({ open: true, author });
  };

  const handleDeleteAuthor = (author: Author) => {
    setDeleteAuthorDialog({ open: true, author });
  };

  const handleCloseDialog = () => {
    setAuthorDialog({ open: false, author: undefined });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteAuthorDialog({ open: false, author: undefined });
  };

  const handleSuccess = () => {
    fetchAuthors();
    handleCloseDialog();
  };

  const handleConfirmDelete = async () => {
    if (!deleteAuthorDialog.author) return;

    try {
      setIsDeleting(true);
      await authorsApi.delete(deleteAuthorDialog.author.id);
      toast.success("Penulis berhasil dihapus", {
        description: `"${deleteAuthorDialog.author.name}" telah dihapus dari sistem`,
      });
      handleCloseDeleteDialog();
      
      // If deleting the last item on a page that's not page 1, go back one page
      if (authors.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchAuthors();
      }
    } catch (error: any) {
      console.error("Error deleting author:", error);
      toast.error("Gagal menghapus penulis", {
        description: error.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Penulis</CardTitle>
          <CardDescription>
            Kelola dan pantau data penulis buku
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onRefresh={fetchAuthors}
            placeholder="Cari nama author atau biografi..."
          />

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 rounded-lg border bg-muted animate-pulse" />
              ))}
            </div>
          ) : authors.length === 0 ? (
            <EmptyState
              icon={UserCircle}
              title={searchQuery ? "Tidak ada hasil" : "Belum ada penulis"}
              description={searchQuery ? "Coba ubah kata kunci pencarian Anda" : "Mulai tambahkan penulis ke perpustakaan"}
            />
          ) : (
            <>
              <AuthorsTable
                authors={authors}
                loading={loading}
                onEdit={handleEditAuthor}
                onDelete={handleDeleteAuthor}
              />
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                total={total}
                perPage={perPage}
                onPageChange={setPage}
                itemLabel="penulis"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AuthorDialog
        open={authorDialog.open}
        author={authorDialog.author}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
      />

      <DeleteConfirmation
        open={deleteAuthorDialog.open}
        onOpenChange={(open) => {
          if (!open) handleCloseDeleteDialog();
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Penulis"
        description={
          deleteAuthorDialog.author
            ? `Apakah Anda yakin ingin menghapus penulis "${deleteAuthorDialog.author.name}"? Tindakan ini tidak dapat dibatalkan.`
            : ""
        }
        isLoading={isDeleting}
      />
    </>
  );
}
