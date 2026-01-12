'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BookOpen, Users, BookMarked, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Admin Dashboard 🛡️
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
                Total Pengguna
              </CardTitle>
              <Users className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">150</div>
              <p className="text-xs text-gray-500 mt-1">Pengguna terdaftar</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Buku
              </CardTitle>
              <BookOpen className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">500</div>
              <p className="text-xs text-gray-500 mt-1">Buku dalam sistem</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Peminjaman Aktif
              </CardTitle>
              <BookMarked className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">45</div>
              <p className="text-xs text-gray-500 mt-1">Sedang dipinjam</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Aktivitas Hari Ini
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">28</div>
              <p className="text-xs text-gray-500 mt-1">Transaksi hari ini</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Admin</CardTitle>
            <CardDescription>Kelola sistem perpustakaan</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button className="bg-emerald-600 hover:bg-emerald-700" style={{ backgroundColor: 'var(--brand-primary-dark)' }}>
              <Users className="mr-2 h-4 w-4" />
              Kelola Pengguna
            </Button>
            <Button variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              Kelola Buku
            </Button>
            <Button variant="outline">
              <BookMarked className="mr-2 h-4 w-4" />
              Kelola Peminjaman
            </Button>
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Lihat Laporan
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
