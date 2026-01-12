'use client';

import { format } from 'date-fns';
import { User, BookOpen, Clock } from 'lucide-react';
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
  };
  borrowed_date: string;
  due_date: string;
  return_date: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'borrowed' | 'returned' | 'overdue' | 'cancelled';
  fine_amount: number;
  notes: string | null;
}

interface BorrowingDetailDialogProps {
  borrowing: Borrowing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  pending: {
    label: 'Menunggu',
    variant: 'secondary' as const,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
  approved: {
    label: 'Disetujui',
    variant: 'default' as const,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  rejected: {
    label: 'Ditolak',
    variant: 'destructive' as const,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
  borrowed: {
    label: 'Borrowed',
    variant: 'default' as const,
  },
  overdue: {
    label: 'Overdue',
    variant: 'destructive' as const,
  },
  returned: {
    label: 'Returned',
    variant: 'secondary' as const,
  },
  cancelled: {
    label: 'Dibatalkan',
    variant: 'outline' as const,
  },
};

export function BorrowingDetailDialog({ borrowing, open, onOpenChange }: BorrowingDetailDialogProps) {
  if (!borrowing) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Borrowing Details</DialogTitle>
          <DialogDescription>Complete information about this borrowing record</DialogDescription>
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
                    src={borrowing.user.profile.avatar!}
                    alt={borrowing.user.profile.full_name}
                  />
                  <AvatarFallback>{borrowing.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{borrowing.user.profile.full_name}</p>
                  <p className="text-sm text-muted-foreground">{borrowing.user.email}</p>
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
                    src={borrowing.book_copy.book.cover_image || '/placeholder-book.png'}
                    alt={borrowing.book_copy.book.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">{borrowing.book_copy.book.title}</p>
                  <p className="text-sm text-muted-foreground mb-1">ISBN: {borrowing.book_copy.book.isbn}</p>
                  <p className="text-sm text-muted-foreground">Copy Number: #{borrowing.book_copy.copy_number}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Borrowing Details */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Borrowing Details
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Borrow Date</p>
                  <p className="font-medium">{format(new Date(borrowing.borrowed_date), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{format(new Date(borrowing.due_date), 'PPP')}</p>
                </div>
                {borrowing.return_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Return Date</p>
                    <p className="font-medium">{format(new Date(borrowing.return_date), 'PPP')}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={statusConfig[borrowing.status].variant} className="mt-1">
                    {statusConfig[borrowing.status].label}
                  </Badge>
                </div>
              </div>
              {borrowing.fine_amount > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">Fine Amount</p>
                  <p className="text-lg font-bold text-red-600">
                    Rp {borrowing.fine_amount.toLocaleString('id-ID')}
                  </p>
                </div>
              )}
              {borrowing.notes && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{borrowing.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
