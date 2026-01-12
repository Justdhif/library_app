'use client';

import { useEffect, useState } from 'react';
import { booksApi } from '@/lib/api/books';
import { Book } from '@/lib/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { StatsCards, StatCardData, EmptyState, SearchBar, Pagination } from '@/components/custom-ui';
import { BookOpen, Library, CheckCircle2, XCircle } from 'lucide-react';
import { BooksTable } from './BooksTable';
import { TableSkeleton } from './TableSkeleton';
import { DeleteConfirmation } from '@/components/ui/delete-confirmation';
import { useLanguage } from '@/lib/language-context';

export function BooksClient() {
  const { t } = useLanguage();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    book: Book | null;
  }>({
    isOpen: false,
    book: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const perPage = 8;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch books when page or debounced search changes
  useEffect(() => {
    fetchBooks();
  }, [page, debouncedSearchQuery]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await booksApi.getAll({
        page,
        per_page: perPage,
        search: debouncedSearchQuery || undefined,
      });
      
      setBooks(Array.isArray(response.data) ? response.data : []);
      setTotal(response.total || 0);
    } catch (error: any) {
      toast.error(t('books.failedLoadBooks'), {
        description: error.response?.data?.message || t('books.errorOccurred'),
      });
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteDialog.book) return;

    try {
      setIsDeleting(true);
      await booksApi.delete(deleteDialog.book.id);
      toast.success(t('books.deleteSuccess'), {
        description: t('books.deleteSuccessDescription').replace('{title}', deleteDialog.book.title),
      });
      setDeleteDialog({ isOpen: false, book: null });
      
      // If deleting the last item on a page that's not page 1, go back one page
      if (books.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchBooks();
      }
    } catch (error: any) {
      toast.error(t('books.deleteFailed'), {
        description: error.response?.data?.message || t('books.errorOccurred'),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (book: Book) => {
    setDeleteDialog({ isOpen: true, book });
  };

  const totalPages = Math.ceil(total / perPage);
  const availableCount = Array.isArray(books) 
    ? books.filter(b => b.available_copies > 0).length 
    : 0;
  const unavailableCount = Array.isArray(books) 
    ? books.filter(b => b.available_copies === 0).length 
    : 0;
  const currentPageCount = Array.isArray(books) ? books.length : 0;

  const stats: StatCardData[] = [
    {
      title: t('books.totalBooks'),
      value: total,
      description: t('books.pageOf').replace('{page}', String(page)).replace('{total}', String(totalPages || 1)),
      icon: Library,
      gradient: true,
    },
    {
      title: t('books.thisPage'),
      value: currentPageCount,
      description: t('books.fromTotal').replace('{total}', String(total)),
      icon: BookOpen,
    },
    {
      title: t('books.availableBooks'),
      value: availableCount,
      description: t('books.canBorrow'),
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      textColor: 'text-green-600',
    },
    {
      title: t('books.unavailableBooks'),
      value: unavailableCount,
      description: t('books.currentlyBorrowed'),
      icon: XCircle,
      iconColor: 'text-red-600',
      textColor: 'text-red-600',
    },
  ];

  return (
    <>
      <StatsCards stats={stats} columns={4} />

      <Card>
        <CardHeader>
          <CardTitle>{t('books.bookList')}</CardTitle>
          <CardDescription>
            {t('books.searchAndManage')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onRefresh={fetchBooks}
            placeholder={t('books.searchPlaceholder')}
          />

              {loading ? (
                <TableSkeleton />
              ) : books.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title={searchQuery ? t('books.noResults') : t('books.noBooksYet')}
                  description={searchQuery ? t('books.noResultsDescription') : t('books.startAdding')}
                />
              ) : (
                <>
                  <BooksTable
                    books={books}
                    onDelete={openDeleteDialog}
                  />
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    total={total}
                    perPage={perPage}
                    onPageChange={setPage}
                    itemLabel={t('books.itemLabel')}
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
            setDeleteDialog({ isOpen: false, book: null });
          }
        }}
        onConfirm={handleDelete}
        title={t('books.deleteConfirmTitle')}
        description={
          deleteDialog.book
            ? t('books.deleteConfirmDescription').replace('{title}', deleteDialog.book.title)
            : ''
        }
        isLoading={isDeleting}
      />
    </>
  );
}
