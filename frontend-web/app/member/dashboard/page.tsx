'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BookOpen, BookMarked, Calendar, User } from 'lucide-react';

export default function MemberDashboard() {
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
              Selamat Datang, {user?.profile?.full_name || user?.username}! 👋
            </h1>
            <p className="text-gray-600 mt-2">Dashboard Member - Library Management System</p>
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
                Buku Tersedia
              </CardTitle>
              <BookOpen className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">250</div>
              <p className="text-xs text-gray-500 mt-1">Total buku yang bisa dipinjam</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Sedang Dipinjam
              </CardTitle>
              <BookMarked className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">2</div>
              <p className="text-xs text-gray-500 mt-1">Buku yang sedang Anda pinjam</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Jatuh Tempo
              </CardTitle>
              <Calendar className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">1</div>
              <p className="text-xs text-gray-500 mt-1">Buku yang harus segera dikembalikan</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Riwayat Pinjam
              </CardTitle>
              <User className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">15</div>
              <p className="text-xs text-gray-500 mt-1">Total buku yang pernah dipinjam</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Kelola aktivitas perpustakaan Anda</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button className="bg-emerald-600 hover:bg-emerald-700" style={{ backgroundColor: 'var(--brand-primary-dark)' }}>
              <BookOpen className="mr-2 h-4 w-4" />
              Telusuri Buku
            </Button>
            <Button variant="outline">
              <BookMarked className="mr-2 h-4 w-4" />
              Pinjaman Saya
            </Button>
            <Button variant="outline">
              <User className="mr-2 h-4 w-4" />
              Profile Saya
            </Button>
          </CardContent>
        </Card>

        {/* User Profile Info */}
        {user?.profile && (
          <Card>
            <CardHeader>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>Detail akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Username</p>
                <p className="text-base font-semibold">{user.username}</p>
              </div>
              {user.profile.phone && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Telepon</p>
                  <p className="text-base font-semibold">{user.profile.phone}</p>
                </div>
              )}
              {user.profile.city && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Kota</p>
                  <p className="text-base font-semibold">{user.profile.city}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
