'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { ArrowLeft, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import { format } from 'date-fns';

interface Borrowing {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    profile: {
      full_name: string;
      avatar: string | null;
    };
  };
  book_copy: {
    id: number;
    book: {
      id: number;
      title: string;
      isbn: string;
      cover_image: string | null;
    };
    copy_number: number;
    barcode: string;
  };
  borrowed_date: string;
  due_date: string;
  status: string;
}

function ProcessReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const borrowingId = searchParams.get('borrowing');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [borrowing, setBorrowing] = useState<Borrowing | null>(null);
  const [condition, setCondition] = useState<string>('good');
  const [returnNotes, setReturnNotes] = useState('');
  const [fineInfo, setFineInfo] = useState<{has_fine: boolean; amount: number; formatted_amount: string; fine_type?: any} | null>(null);
  const [loadingFine, setLoadingFine] = useState(false);

  useEffect(() => {
    if (borrowingId) {
      fetchBorrowingDetail();
    } else {
      toast.error('ID peminjaman tidak ditemukan');
      router.push('/borrowings');
    }
  }, [borrowingId]);

  const fetchBorrowingDetail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/borrowings/${borrowingId}`);
      setBorrowing(response.data.data);
    } catch (error: any) {
      toast.error('Gagal memuat detail peminjaman', {
        description: error.response?.data?.message || 'Terjadi kesalahan',
      });
      router.push('/borrowings');
    } finally {
      setLoading(false);
    }
  };

  const fetchFineInfo = async (selectedCondition: string) => {
    if (!['fair', 'poor', 'damaged'].includes(selectedCondition)) {
      setFineInfo(null);
      return;
    }

    try {
      setLoadingFine(true);
      const response = await apiClient.get('/fine-types/by-condition', {
        params: { condition: selectedCondition }
      });
      setFineInfo(response.data.data);
    } catch (error: any) {
      console.error('Error fetching fine info:', error);
      setFineInfo(null);
    } finally {
      setLoadingFine(false);
    }
  };

  const handleConditionChange = (value: string) => {
    setCondition(value);
    fetchFineInfo(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!condition) {
      toast.error('Pilih kondisi buku');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post('/returns', {
        borrowing_id: borrowingId,
        condition,
        return_notes: returnNotes || undefined,
      });

      toast.success('Pengembalian berhasil diproses', {
        description: 'Buku telah berhasil dikembalikan',
      });
      router.push('/returns');
    } catch (error: any) {
      toast.error('Gagal memproses pengembalian', {
        description: error.response?.data?.message || 'Terjadi kesalahan',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!borrowing || !borrowing.book_copy || !borrowing.book_copy.book) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Data peminjaman tidak ditemukan atau tidak lengkap</p>
      </div>
    );
  }

  // Calculate if overdue
  const dueDate = new Date(borrowing.due_date);
  const today = new Date();
  const isOverdue = today > dueDate;
  const daysOverdue = isOverdue ? Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Process Book Return</h1>
          <p className="text-muted-foreground mt-1">Complete the return process for this borrowing</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left side - Borrowing Info */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={borrowing.user?.profile?.avatar || ''}
                    alt={borrowing.user?.profile?.full_name || 'User'}
                  />
                  <AvatarFallback>{borrowing.user?.profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{borrowing.user?.profile?.full_name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{borrowing.user?.email || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Book Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="relative w-16 h-24 shrink-0">
                  <Image
                    src={borrowing.book_copy?.book?.cover_image || '/placeholder-book.png'}
                    alt={borrowing.book_copy?.book?.title || 'Book cover'}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">{borrowing.book_copy?.book?.title || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground mb-1">ISBN: {borrowing.book_copy?.book?.isbn || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">Copy #{borrowing.book_copy?.copy_number || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">Barcode: {borrowing.book_copy?.barcode || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Borrowing Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Borrowed Date</p>
                <p className="font-medium">{format(new Date(borrowing.borrowed_date), 'PPP')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">{format(new Date(borrowing.due_date), 'PPP')}</p>
              </div>
              {isOverdue && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-red-600">Overdue by {daysOverdue} days</p>
                  <p className="text-xs text-red-500 mt-1">A fine may be applied</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right side - Return Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Return Information</CardTitle>
              <CardDescription>Fill in the details of the book return</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="condition">Book Condition *</Label>
                  <Select value={condition} onValueChange={handleConditionChange}>
                    <SelectTrigger id="condition">
                      <SelectValue placeholder="Select book condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New - Like new, no visible wear</SelectItem>
                      <SelectItem value="good">Good - Minor wear, good condition</SelectItem>
                      <SelectItem value="fair">Fair - Noticeable wear, acceptable condition</SelectItem>
                      <SelectItem value="poor">Poor - Significant wear, damaged</SelectItem>
                      <SelectItem value="damaged">Damaged - Severely damaged</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select the current condition of the returned book
                  </p>

                  {/* Fine Warning */}
                  {loadingFine && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                      <p className="text-sm text-blue-600">Loading fine information...</p>
                    </div>
                  )}

                  {fineInfo && fineInfo.has_fine && (
                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mt-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-amber-900 mb-1">⚠️ Peringatan Denda</p>
                          <p className="text-sm text-amber-800 mb-2">
                            Kondisi buku ini akan dikenakan denda karena dikategorikan sebagai <strong>{fineInfo.fine_type?.name}</strong>
                          </p>
                          <div className="bg-white rounded p-2 border border-amber-200">
                            <p className="text-xs text-gray-600 mb-1">Jumlah Denda:</p>
                            <p className="text-lg font-bold text-red-600">{fineInfo.formatted_amount}</p>
                          </div>
                          {fineInfo.fine_type?.description && (
                            <p className="text-xs text-amber-700 mt-2">{fineInfo.fine_type.description}</p>
                          )}
                          <p className="text-xs text-amber-800 mt-2 font-medium">
                            Status pengembalian akan di-<strong>REJECT</strong> dan memerlukan approval manual.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {condition && ['new', 'good'].includes(condition) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-900">✓ Tidak Ada Denda</p>
                          <p className="text-xs text-green-700 mt-1">
                            Kondisi buku baik. Pengembalian akan otomatis disetujui.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnNotes">Return Notes (Optional)</Label>
                  <Textarea
                    id="returnNotes"
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="Add any notes about the return (damage, missing pages, etc.)"
                    rows={5}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={submitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isSubmit
                    isLoading={submitting}
                    className="flex-1"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Process Return
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ProcessReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ProcessReturnContent />
    </Suspense>
  );
}
