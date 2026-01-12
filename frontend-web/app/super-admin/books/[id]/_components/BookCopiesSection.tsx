'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Package, MapPin, Calendar, DollarSign, BookOpen } from 'lucide-react';
import { Pagination } from '@/components/custom-ui';
import { BookCopiesSkeleton } from './BookCopiesSkeleton';
import { BookCopyBarcode } from './BookCopyBarcode';

interface BookCopy {
  id: number;
  book_id: number;
  barcode: string;
  call_number: string;
  condition: 'new' | 'good' | 'fair' | 'poor';
  status: 'available' | 'borrowed' | 'damaged' | 'lost' | 'maintenance';
  location?: string;
  shelf_number?: string;
  acquisition_date?: string;
  acquisition_price?: number;
  notes?: string;
  times_borrowed: number;
  created_at: string;
  updated_at: string;
}

interface BookCopiesSectionProps {
  copies: BookCopy[];
  loading?: boolean;
  totalCopies: number;
  bookTitle?: string;
  onAddCopy: () => void;
  onEditCopy: (copy: BookCopy) => void;
  onDeleteCopy: (copy: BookCopy) => void;
  totalCopiesInDb: number;
  currentPage?: number;
  copiesPerPage?: number;
  onPageChange?: (page: number) => void;
}

const conditionColors = {
  new: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
  good: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800',
  fair: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800',
  poor: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
};

const statusColors = {
  available: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
  borrowed: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800',
  damaged: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
  lost: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  maintenance: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
};

const conditionLabels = {
  new: 'Baru',
  good: 'Baik',
  fair: 'Cukup',
  poor: 'Buruk',
};

const statusLabels = {
  available: 'Tersedia',
  borrowed: 'Dipinjam',
  damaged: 'Rusak',
  lost: 'Hilang',
  maintenance: 'Maintenance',
};

export function BookCopiesSection({
  copies,
  loading = false,
  totalCopies,
  bookTitle,
  onAddCopy,
  onEditCopy,
  onDeleteCopy,
  totalCopiesInDb,
  currentPage = 1,
  copiesPerPage = 6,
  onPageChange,
}: BookCopiesSectionProps) {
  const totalPages = Math.ceil(totalCopiesInDb / copiesPerPage);
  const canAddMore = totalCopiesInDb < totalCopies;
  const availableCount = copies.filter(c => c.status === 'available').length;
  const borrowedCount = copies.filter(c => c.status === 'borrowed').length;

  return (
    <Card className="shadow-sm pt-0 overflow-hidden">
      <CardHeader className="border-b bg-linear-to-r from-emerald-50 to-transparent dark:from-emerald-950/30 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                <Package className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              Salinan Buku Fisik
            </CardTitle>
            <CardDescription className="mt-2 flex items-center gap-4">
              <span>Kelola salinan fisik buku yang tersedia di perpustakaan</span>
              <div className="flex gap-3 text-xs font-medium">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded">
                  <span className="h-1.5 w-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full"></span>
                  {availableCount} Tersedia
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded">
                  <span className="h-1.5 w-1.5 bg-orange-500 dark:bg-orange-400 rounded-full"></span>
                  {borrowedCount} Dipinjam
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                  <span className="h-1.5 w-1.5 bg-gray-500 dark:bg-gray-400 rounded-full"></span>
                  {copies.length}/{totalCopies} Total
                </span>
              </div>
            </CardDescription>
          </div>
          <Button 
            onClick={onAddCopy} 
            disabled={!canAddMore || loading}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            title={!canAddMore ? `Maksimal ${totalCopies} salinan sudah tercapai` : 'Tambah salinan baru'}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Salinan
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <BookCopiesSkeleton />
        ) : copies.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Belum ada salinan buku</h3>
            <p className="text-sm text-muted-foreground mb-4">Tambahkan salinan fisik buku untuk mulai tracking inventori</p>
            <Button onClick={onAddCopy} variant="outline" className="mt-2">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Salinan Pertama
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {copies.map((copy) => (
              <Card key={copy.id} className="group border hover:border-emerald-200 hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  {/* Compact Header with Actions */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge className={`text-[10px] px-1.5 py-0.5 ${statusColors[copy.status]} font-medium`}>
                        {statusLabels[copy.status]}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${conditionColors[copy.condition]} font-medium`}>
                        {conditionLabels[copy.condition]}
                      </Badge>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-emerald-50 hover:text-emerald-700"
                        onClick={() => onEditCopy(copy)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDeleteCopy(copy)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Compact Barcode Section */}
                  <div className="mb-3">
                    <BookCopyBarcode 
                      barcode={copy.barcode}
                      callNumber={copy.call_number}
                      bookTitle={bookTitle}
                    />
                  </div>

                  {/* Compact Info Grid - 2 Columns */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {copy.location && (
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 col-span-2">
                        <MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="truncate text-[11px]">
                          {copy.location}{copy.shelf_number && ` • Rak ${copy.shelf_number}`}
                        </span>
                      </div>
                    )}

                    {copy.acquisition_date && (
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <Calendar className="h-3 w-3 text-purple-600 dark:text-purple-400 shrink-0" />
                        <span className="text-[11px]">{new Date(copy.acquisition_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    )}

                    {copy.acquisition_price && (
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <DollarSign className="h-3 w-3 text-yellow-600 dark:text-yellow-400 shrink-0" />
                        <span className="font-semibold text-[11px]">Rp {(copy.acquisition_price / 1000).toFixed(0)}K</span>
                      </div>
                    )}
                  </div>

                  {/* Compact Stats Footer */}
                  <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">PEMINJAMAN</span>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center justify-center w-5 h-5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">{copy.times_borrowed}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">kali</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && copies.length > 0 && onPageChange && (
          <div className="mt-6 pt-4 border-t">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={totalCopiesInDb}
              perPage={copiesPerPage}
              onPageChange={onPageChange}
              itemLabel="salinan"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
