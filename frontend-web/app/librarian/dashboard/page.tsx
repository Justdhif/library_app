'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BookOpen, BookMarked, ClipboardCheck, AlertCircle } from 'lucide-react';

export default function LibrarianDashboard() {
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Librarian Dashboard 📚
            </h1>
            <p className="text-gray-600 mt-2">Selamat datang, {user?.profile?.full_name || user?.username}</p>
          </div>
          {user?.profile?.avatar && (
            <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
              <AvatarImage
                src={user.profile.avatar}
                alt="Avatar"
              />
              <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Approval
              </CardTitle>
              <ClipboardCheck className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">8</div>
              <p className="text-xs text-gray-500 mt-1">Menunggu persetujuan</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Buku Tersedia
              </CardTitle>
              <BookOpen className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">250</div>
              <p className="text-xs text-gray-500 mt-1">Siap dipinjam</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Dipinjam
              </CardTitle>
              <BookMarked className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">45</div>
              <p className="text-xs text-gray-500 mt-1">Sedang dipinjam</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Terlambat
              </CardTitle>
              <AlertCircle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">3</div>
              <p className="text-xs text-gray-500 mt-1">Lewat jatuh tempo</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Pustakawan</CardTitle>
            <CardDescription>Kelola operasional perpustakaan</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button className="bg-green-600 hover:bg-green-700">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Approve Peminjaman
            </Button>
            <Button variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              Tambah Buku
            </Button>
            <Button variant="outline">
              <BookMarked className="mr-2 h-4 w-4" />
              Proses Pengembalian
            </Button>
            <Button variant="outline">
              <AlertCircle className="mr-2 h-4 w-4" />
              Cek Keterlambatan
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
