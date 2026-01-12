'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { StatsCards, StatCardData, SearchBar, Pagination } from '@/components/custom-ui';
import { RotateCcw, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';
import { ReturnsTable } from './ReturnsTable';
import { ReturnDetailDialog } from './ReturnDetailDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

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

export function ReturnsClient() {
  const [returns, setReturns] = useState<BookReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedReturn, setSelectedReturn] = useState<BookReturn | null>(null);
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

  // Fetch returns when page, search, or filter changes
  useEffect(() => {
    fetchReturns();
  }, [page, debouncedSearchQuery, statusFilter]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await apiClient.get(`/returns?${params.toString()}`);
      
      const data = response.data.data;
      if (Array.isArray(data)) {
        setReturns(data);
        setTotal(response.data.total || data.length);
      } else if (data && Array.isArray(data.data)) {
        setReturns(data.data);
        setTotal(data.total || data.data.length);
      } else {
        setReturns([]);
        setTotal(0);
      }
    } catch (error: any) {
      toast.error('Gagal memuat data pengembalian', {
        description: error.response?.data?.message || 'Terjadi kesalahan',
      });
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (returnData: BookReturn) => {
    setSelectedReturn(returnData);
    setIsDetailOpen(true);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await apiClient.get(`/returns/export?${params.toString()}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `returns-${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
  const approvedCount = Array.isArray(returns) ? returns.filter(r => r.status === 'approved').length : 0;
  const pendingCount = Array.isArray(returns) ? returns.filter(r => r.status === 'pending').length : 0;
  const totalFines = Array.isArray(returns) ? returns.reduce((sum, r) => sum + r.fine_amount, 0) : 0;

  const stats: StatCardData[] = [
    {
      title: 'Total Pengembalian',
      value: total,
      description: `Halaman ${page} dari ${totalPages || 1}`,
      icon: RotateCcw,
      gradient: true,
    },
    {
      title: 'Disetujui',
      value: approvedCount,
      description: 'Sudah disetujui',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      textColor: 'text-green-600',
    },
    {
      title: 'Menunggu',
      value: pendingCount,
      description: 'Perlu review',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      textColor: 'text-amber-600',
    },
    {
      title: 'Total Denda',
      value: `Rp ${totalFines.toLocaleString('id-ID')}`,
      description: 'Denda terkumpul',
      icon: DollarSign,
      iconColor: 'text-blue-600',
      textColor: 'text-blue-600',
    },
  ];

  return (
    <>
      <StatsCards stats={stats} columns={4} />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengembalian</CardTitle>
          <CardDescription>
            Kelola dan monitor pengembalian buku
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onRefresh={fetchReturns}
                placeholder="Cari nama member, email, judul buku, atau ISBN..."
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ReturnsTable
            returns={returns}
            loading={loading}
            onViewDetail={handleViewDetail}
            onRefresh={fetchReturns}
          />

          {!loading && returns.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              total={total}
              perPage={perPage}
            />
          )}
        </CardContent>
      </Card>

      <ReturnDetailDialog
        returnData={selectedReturn}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onRefresh={fetchReturns}
      />
    </>
  );
}
