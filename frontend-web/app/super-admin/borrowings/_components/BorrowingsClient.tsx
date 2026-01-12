'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { StatsCards, StatCardData, SearchBar, Pagination } from '@/components/custom-ui';
import { BookMarked, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';
import { BorrowingsTable } from './BorrowingsTable';
import { BorrowingDetailDialog } from './BorrowingDetailDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

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

export function BorrowingsClient() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const perPage = 10;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch borrowings when page, search, or filter changes
  useEffect(() => {
    fetchBorrowings();
  }, [page, debouncedSearchQuery, statusFilter]);

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await apiClient.get(`/borrowings?${params.toString()}`);
      
      const data = response.data.data;
      if (Array.isArray(data)) {
        setBorrowings(data);
        setTotal(response.data.total || data.length);
      } else if (data && Array.isArray(data.data)) {
        setBorrowings(data.data);
        setTotal(data.total || data.data.length);
      } else {
        setBorrowings([]);
        setTotal(0);
      }
    } catch (error: any) {
      toast.error('Gagal memuat data peminjaman', {
        description: error.response?.data?.message || 'Terjadi kesalahan',
      });
      setBorrowings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (borrowing: Borrowing) => {
    setSelectedBorrowing(borrowing);
    setIsDetailOpen(true);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await apiClient.get(`/borrowings/export?${params.toString()}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `borrowings-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Data berhasil diexport');
    } catch (error: any) {
      toast.error('Gagal export data');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / perPage);
  const activeCount = Array.isArray(borrowings) ? borrowings.filter(b => b.status === 'borrowed').length : 0;
  const overdueCount = Array.isArray(borrowings) ? borrowings.filter(b => b.status === 'overdue').length : 0;
  const returnedCount = Array.isArray(borrowings) ? borrowings.filter(b => b.status === 'returned').length : 0;

  const stats: StatCardData[] = [
    {
      title: 'Total Peminjaman',
      value: total,
      description: `Halaman ${page} dari ${totalPages || 1}`,
      icon: BookMarked,
      gradient: true,
    },
    {
      title: 'Dipinjam',
      value: activeCount,
      description: 'Sedang dipinjam',
      icon: BookOpen,
      iconColor: 'text-blue-600',
      textColor: 'text-blue-600',
    },
    {
      title: 'Terlambat',
      value: overdueCount,
      description: 'Perlu perhatian',
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      textColor: 'text-red-600',
    },
    {
      title: 'Dikembalikan',
      value: returnedCount,
      description: 'Sudah dikembalikan',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      textColor: 'text-green-600',
    },
  ];

  return (
    <>
      <StatsCards stats={stats} columns={4} />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Peminjaman</CardTitle>
          <CardDescription>
            Kelola dan monitor peminjaman buku
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onRefresh={fetchBorrowings}
                placeholder="Cari nama member, email, judul buku, atau ISBN..."
                showExport={true}
                onExport={handleExport}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="borrowed">Dipinjam</SelectItem>
                <SelectItem value="overdue">Terlambat</SelectItem>
                <SelectItem value="returned">Dikembalikan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <BorrowingsTable
            borrowings={borrowings}
            loading={loading}
            onViewDetail={handleViewDetail}
          />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            total={total}
            perPage={perPage}
            onPageChange={setPage}
            itemLabel="peminjaman"
          />
        </CardContent>
      </Card>

      <BorrowingDetailDialog 
        borrowing={selectedBorrowing}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </>
  );
}
