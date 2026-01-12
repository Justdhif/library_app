'use client';

import { ReturnsTableRow } from './ReturnsTableRow';
import { Loader2 } from 'lucide-react';

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

interface ReturnsTableProps {
  returns: BookReturn[];
  loading: boolean;
  onViewDetail: (returnData: BookReturn) => void;
  onRefresh: () => void;
}

export function ReturnsTable({ returns, loading, onViewDetail, onRefresh }: ReturnsTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (returns.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Tidak ada data pengembalian</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">Member</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Buku</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Tgl Pinjam</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Tgl Kembali</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Kondisi</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Denda</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-4 py-3 text-right text-sm font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {returns.map((returnData) => (
            <ReturnsTableRow
              key={returnData.id}
              returnData={returnData}
              onViewDetail={onViewDetail}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
