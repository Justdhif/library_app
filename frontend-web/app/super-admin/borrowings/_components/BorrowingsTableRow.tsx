'use client';

import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Eye, CheckCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  created_at: string;
}

interface BorrowingsTableRowProps {
  borrowing: Borrowing;
  onViewDetail: (borrowing: Borrowing) => void;
}

const statusConfig = {
  pending: { label: 'Menunggu', variant: 'secondary' as const },
  approved: { label: 'Disetujui', variant: 'default' as const },
  rejected: { label: 'Ditolak', variant: 'destructive' as const },
  borrowed: { label: 'Dipinjam', variant: 'default' as const },
  overdue: { label: 'Terlambat', variant: 'destructive' as const },
  returned: { label: 'Dikembalikan', variant: 'secondary' as const },
  cancelled: { label: 'Dibatalkan', variant: 'outline' as const },
};

export function BorrowingsTableRow({ borrowing, onViewDetail }: BorrowingsTableRowProps) {
  const router = useRouter();

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue(borrowing.due_date);

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={borrowing.user.profile.avatar!}
              alt={borrowing.user.profile.full_name}
            />
            <AvatarFallback>{borrowing.user.profile.full_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{borrowing.user.profile.full_name}</p>
            <p className="text-xs text-muted-foreground">{borrowing.user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-14">
            <Image
              src={borrowing.book_copy.book.cover_image || '/placeholder-book.png'}
              alt={borrowing.book_copy.book.title}
              fill
              className="object-cover rounded shadow-sm"
            />
          </div>
          <div className="max-w-xs">
            <p className="font-medium text-sm truncate">{borrowing.book_copy.book.title}</p>
            <p className="text-xs text-muted-foreground">Salinan #{borrowing.book_copy.copy_number}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm">{format(new Date(borrowing.borrowed_date), 'dd MMM yyyy')}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm">{format(new Date(borrowing.due_date), 'dd MMM yyyy')}</p>
          {borrowing.status === 'borrowed' && (
            <p className={`text-xs ${daysUntilDue < 0 ? 'text-red-600 font-semibold' : daysUntilDue <= 3 ? 'text-amber-600' : 'text-gray-500'}`}>
              {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} hari terlambat` : `${daysUntilDue} hari lagi`}
            </p>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant={statusConfig[borrowing.status].variant}>
          {statusConfig[borrowing.status].label}
        </Badge>
      </td>
      <td className="px-4 py-3">
        {borrowing.fine_amount > 0 ? (
          <span className="text-red-600 font-semibold text-sm">
            Rp {borrowing.fine_amount.toLocaleString('id-ID')}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewDetail(borrowing)}>
              <Eye className="w-4 h-4 mr-2" />
              Lihat Detail
            </DropdownMenuItem>
            {borrowing.status === 'approved' && (
              <DropdownMenuItem onClick={() => router.push(`/returns/process?borrowing=${borrowing.id}`)}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Pengembalian
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
