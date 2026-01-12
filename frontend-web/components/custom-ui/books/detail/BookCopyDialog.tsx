'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookCopy } from '@/lib/api/bookCopies';

const bookCopySchema = z.object({
  barcode: z.string().min(1, 'Barcode harus diisi').max(50, 'Barcode terlalu panjang'),
  call_number: z.string().min(1, 'Call number harus diisi').max(50, 'Call number terlalu panjang'),
  condition: z.enum(['new', 'good', 'fair', 'poor'], {
    message: 'Kondisi harus dipilih',
  }),
  status: z.enum(['available', 'borrowed', 'damaged', 'lost', 'maintenance'], {
    message: 'Status harus dipilih',
  }),
  location: z.string().max(100, 'Lokasi terlalu panjang').optional(),
  shelf_number: z.string().max(50, 'Nomor rak terlalu panjang').optional(),
  acquisition_date: z.string().optional(),
  acquisition_price: z.string().optional(),
  notes: z.string().max(500, 'Catatan terlalu panjang').optional(),
});

type BookCopyFormData = z.infer<typeof bookCopySchema>;

interface BookCopyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BookCopyFormData) => Promise<void>;
  copy?: BookCopy | null;
  isLoading?: boolean;
  totalCopies: number;
  currentCopiesCount: number;
}

export function BookCopyDialog({
  open,
  onOpenChange,
  onSubmit,
  copy,
  isLoading = false,
  totalCopies,
  currentCopiesCount,
}: BookCopyDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookCopyFormData>({
    resolver: zodResolver(bookCopySchema),
  });

  const condition = watch('condition');
  const status = watch('status');

  useEffect(() => {
    if (copy) {
      reset({
        barcode: copy.barcode,
        call_number: copy.call_number,
        condition: copy.condition,
        status: copy.status,
        location: copy.location || '',
        shelf_number: copy.shelf_number || '',
        acquisition_date: copy.acquisition_date
          ? new Date(copy.acquisition_date).toISOString().split('T')[0]
          : '',
        acquisition_price: copy.acquisition_price?.toString() || '',
        notes: copy.notes || '',
      });
    } else {
      reset({
        barcode: '',
        call_number: '',
        condition: 'good',
        status: 'available',
        location: '',
        shelf_number: '',
        acquisition_date: '',
        acquisition_price: '',
        notes: '',
      });
    }
  }, [copy, reset, open]);

  const handleFormSubmit = async (data: BookCopyFormData) => {
    // Validation: Check if adding a new copy exceeds total_copies
    if (!copy && currentCopiesCount >= totalCopies) {
      alert(`Tidak dapat menambah salinan. Maksimal ${totalCopies} salinan sudah tercapai.`);
      return;
    }
    
    await onSubmit(data);
    reset();
  };

  const isAtLimit = !copy && currentCopiesCount >= totalCopies;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{copy ? 'Edit Salinan Buku' : 'Tambah Salinan Buku'}</DialogTitle>
          <DialogDescription>
            {copy
              ? 'Perbarui informasi salinan fisik buku'
              : 'Tambahkan salinan fisik buku baru ke perpustakaan'}
          </DialogDescription>
        </DialogHeader>

        {isAtLimit && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Tidak dapat menambah salinan baru. Batas maksimal {totalCopies} salinan sudah tercapai.</span>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Barcode & Call Number */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">
                Barcode <span className="text-destructive">*</span>
              </Label>
              <Input
                id="barcode"
                {...register('barcode')}
                placeholder="Contoh: BC001234567"
                disabled={isLoading}
              />
              {errors.barcode && (
                <p className="text-sm text-destructive">{errors.barcode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="call_number">
                Call Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="call_number"
                {...register('call_number')}
                placeholder="Contoh: 823.5 HAR"
                disabled={isLoading}
              />
              {errors.call_number && (
                <p className="text-sm text-destructive">{errors.call_number.message}</p>
              )}
            </div>
          </div>

          {/* Condition & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condition">
                Kondisi <span className="text-destructive">*</span>
              </Label>
              <Select
                value={condition}
                onValueChange={(value) => setValue('condition', value as any)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kondisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Baru</SelectItem>
                  <SelectItem value="good">Baik</SelectItem>
                  <SelectItem value="fair">Cukup</SelectItem>
                  <SelectItem value="poor">Buruk</SelectItem>
                </SelectContent>
              </Select>
              {errors.condition && (
                <p className="text-sm text-destructive">{errors.condition.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={status}
                onValueChange={(value) => setValue('status', value as any)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Tersedia</SelectItem>
                  <SelectItem value="borrowed">Dipinjam</SelectItem>
                  <SelectItem value="damaged">Rusak</SelectItem>
                  <SelectItem value="lost">Hilang</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Location & Shelf */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Lokasi</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Contoh: Lantai 2"
                disabled={isLoading}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shelf_number">Nomor Rak</Label>
              <Input
                id="shelf_number"
                {...register('shelf_number')}
                placeholder="Contoh: A12"
                disabled={isLoading}
              />
              {errors.shelf_number && (
                <p className="text-sm text-destructive">{errors.shelf_number.message}</p>
              )}
            </div>
          </div>

          {/* Acquisition Date & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="acquisition_date">Tanggal Akuisisi</Label>
              <Input
                id="acquisition_date"
                type="date"
                {...register('acquisition_date')}
                disabled={isLoading}
              />
              {errors.acquisition_date && (
                <p className="text-sm text-destructive">{errors.acquisition_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="acquisition_price">Harga Akuisisi (Rp)</Label>
              <Input
                id="acquisition_price"
                type="number"
                {...register('acquisition_price')}
                placeholder="Contoh: 150000"
                disabled={isLoading}
              />
              {errors.acquisition_price && (
                <p className="text-sm text-destructive">{errors.acquisition_price.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Catatan tambahan tentang salinan ini..."
              rows={3}
              disabled={isLoading}
            />
            {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              isSubmit 
              isLoading={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {copy ? 'Perbarui' : 'Tambah'} Salinan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
