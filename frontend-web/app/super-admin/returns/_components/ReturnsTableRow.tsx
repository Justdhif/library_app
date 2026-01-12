'use client';

import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Eye, CheckCircle, MoreHorizontal, XCircle } from 'lucide-react';
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

interface ReturnsTableRowProps {
  returnData: BookReturn;
  onViewDetail: (returnData: BookReturn) => void;
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

export function ReturnsTableRow({ returnData, onViewDetail }: ReturnsTableRowProps) {
  const router = useRouter();

  if (!returnData.borrowing) {
    return null;
  }

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={returnData.borrowing.user.profile.avatar!}
              alt={returnData.borrowing.user.profile.full_name}
            />
            <AvatarFallback>{returnData.borrowing.user.profile.full_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{returnData.borrowing.user.profile.full_name}</p>
            <p className="text-xs text-muted-foreground">{returnData.borrowing.user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-14">
            <Image
              src={returnData.borrowing.book_copy.book.cover_image || '/placeholder-book.png'}
              alt={returnData.borrowing.book_copy.book.title}
              fill
              className="object-cover rounded shadow-sm"
            />
          </div>
          <div className="max-w-xs">
            <p className="font-medium text-sm truncate">{returnData.borrowing.book_copy.book.title}</p>
            <p className="text-xs text-muted-foreground">Salinan #{returnData.borrowing.book_copy.copy_number}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm">{format(new Date(returnData.borrowing.borrowed_date), 'dd MMM yyyy')}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm">{format(new Date(returnData.return_date), 'dd MMM yyyy')}</p>
      </td>
      <td className="px-4 py-3">
        <Badge variant={conditionConfig[returnData.condition].variant}>
          {conditionConfig[returnData.condition].label}
        </Badge>
      </td>
      <td className="px-4 py-3">
        {returnData.fine_amount > 0 ? (
          <div className="flex flex-col gap-1">
            <span className="text-red-600 font-semibold text-sm">
              Rp {returnData.fine_amount.toLocaleString('id-ID')}
            </span>
            {returnData.fine_paid && (
              <Badge variant="default" className="w-fit text-xs">
                Lunas
              </Badge>
            )}
            {returnData.fine_waived && (
              <Badge variant="secondary" className="w-fit text-xs">
                Dibebaskan
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge variant={statusConfig[returnData.status].variant}>
          {statusConfig[returnData.status].label}
        </Badge>
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
            <DropdownMenuItem onClick={() => onViewDetail(returnData)}>
              <Eye className="w-4 h-4 mr-2" />
              Lihat Detail
            </DropdownMenuItem>
            {returnData.status === 'pending' && (
              <>
                <DropdownMenuItem>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Setujui
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <XCircle className="w-4 h-4 mr-2" />
                  Tolak
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
