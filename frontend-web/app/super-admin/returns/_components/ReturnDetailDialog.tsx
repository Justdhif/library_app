'use client';

import { format } from 'date-fns';
import { User, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BookReturn {
  id: number;
  borrowing_id: number;
  return_date: string;
  condition: 'new' | 'good' | 'fair' | 'poor' | 'damaged';
  return_notes?: string;
  fine_amount: number;
  fine_paid: boolean;
  fine_paid_date?: string;
  fine_waived: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  borrowing?: {
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
  };
  returned_by_user?: {
    id: number;
    username: string;
    profile: {
      full_name: string;
    };
  };
}

interface ReturnDetailDialogProps {
  returnData: BookReturn | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

const statusConfig = {
  pending: { label: 'Menunggu', variant: 'secondary' as const },
  approved: { label: 'Disetujui', variant: 'default' as const },
  rejected: { label: 'Ditolak', variant: 'destructive' as const },
};

const conditionConfig = {
  new: { label: 'Baru', variant: 'default' as const },
  good: { label: 'Baik', variant: 'default' as const },
  fair: { label: 'Cukup', variant: 'secondary' as const },
  poor: { label: 'Buruk', variant: 'destructive' as const },
  damaged: { label: 'Rusak', variant: 'destructive' as const },
};

export function ReturnDetailDialog({ returnData, open, onOpenChange, onRefresh }: ReturnDetailDialogProps) {
  if (!returnData || !returnData.borrowing) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Return Details</DialogTitle>
          <DialogDescription>Complete information about this book return</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Member Info */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Member Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={returnData.borrowing.user.profile.avatar!}
                    alt={returnData.borrowing.user.profile.full_name}
                  />
                  <AvatarFallback>{returnData.borrowing.user.profile.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{returnData.borrowing.user.profile.full_name}</p>
                  <p className="text-sm text-muted-foreground">{returnData.borrowing.user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Book Info */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Book Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex gap-4">
                <div className="relative w-20 h-28">
                  <Image
                    src={returnData.borrowing.book_copy.book.cover_image || '/placeholder-book.png'}
                    alt={returnData.borrowing.book_copy.book.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">{returnData.borrowing.book_copy.book.title}</p>
                  <p className="text-sm text-muted-foreground mb-1">ISBN: {returnData.borrowing.book_copy.book.isbn}</p>
                  <p className="text-sm text-muted-foreground">Copy Number: #{returnData.borrowing.book_copy.copy_number}</p>
                  <p className="text-sm text-muted-foreground">Barcode: {returnData.borrowing.book_copy.barcode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Return Details */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Return Details
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Borrow Date</p>
                  <p className="font-medium">{format(new Date(returnData.borrowing.borrowed_date), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{format(new Date(returnData.borrowing.due_date), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Return Date</p>
                  <p className="font-medium">{format(new Date(returnData.return_date), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Book Condition</p>
                  <Badge variant={conditionConfig[returnData.condition].variant} className="mt-1">
                    {conditionConfig[returnData.condition].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Return Status</p>
                  <Badge variant={statusConfig[returnData.status].variant} className="mt-1">
                    {statusConfig[returnData.status].label}
                  </Badge>
                </div>
                {returnData.returned_by_user && (
                  <div>
                    <p className="text-sm text-muted-foreground">Processed By</p>
                    <p className="font-medium">{returnData.returned_by_user.profile.full_name}</p>
                  </div>
                )}
              </div>
              
              {/* Fine Information */}
              {returnData.fine_amount > 0 && (
                <div className="pt-3 border-t">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Fine Amount</p>
                      <p className="text-lg font-bold text-red-600">
                        Rp {returnData.fine_amount.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {returnData.fine_paid && (
                      <Badge variant="default">
                        Lunas {returnData.fine_paid_date && `- ${format(new Date(returnData.fine_paid_date), 'PP')}`}
                      </Badge>
                    )}
                    {returnData.fine_waived && (
                      <Badge variant="secondary">
                        Dibebaskan
                      </Badge>
                    )}
                    {!returnData.fine_paid && !returnData.fine_waived && (
                      <Badge variant="destructive">
                        Belum Dibayar
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {returnData.return_notes && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Return Notes</p>
                  <p className="text-sm">{returnData.return_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
