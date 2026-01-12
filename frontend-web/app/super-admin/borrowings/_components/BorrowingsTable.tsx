'use client';

import { TableSkeleton } from './TableSkeleton';
import { BorrowingsTableRow } from './BorrowingsTableRow';
import { EmptyState } from '@/components/custom-ui';
import { BookMarked } from 'lucide-react';

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

interface BorrowingsTableProps {
  borrowings: Borrowing[];
  loading: boolean;
  onViewDetail: (borrowing: Borrowing) => void;
}

export function BorrowingsTable({ borrowings, loading, onViewDetail }: BorrowingsTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Member</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Buku</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Tgl Pinjam</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Tgl Jatuh Tempo</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Denda</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton />
            ) : !Array.isArray(borrowings) || borrowings.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-0">
                  <EmptyState
                    icon={BookMarked}
                    title="Tidak ada peminjaman"
                    description="Belum ada data peminjaman yang ditemukan"
                  />
                </td>
              </tr>
            ) : (
              borrowings.map((borrowing) => (
                <BorrowingsTableRow 
                  key={borrowing.id} 
                  borrowing={borrowing} 
                  onViewDetail={onViewDetail} 
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
