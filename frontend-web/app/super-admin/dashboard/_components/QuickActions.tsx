'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Settings, 
  UserPlus, 
  BookPlus,
  BookMarked,
  Calendar,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      icon: UserPlus,
      label: 'Tambah User',
      description: 'Daftarkan pengguna baru',
      onClick: () => router.push('/users/create'),
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: BookPlus,
      label: 'Tambah Buku',
      description: 'Tambahkan buku baru',
      onClick: () => router.push('/books/create'),
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      icon: Users,
      label: 'Kelola User',
      description: 'Lihat semua pengguna',
      onClick: () => router.push('/users'),
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      icon: BookOpen,
      label: 'Kelola Buku',
      description: 'Lihat semua buku',
      onClick: () => router.push('/books'),
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      icon: FileText,
      label: 'Laporan',
      description: 'Lihat laporan lengkap',
      onClick: () => router.push('/reports'),
      color: 'bg-cyan-500 hover:bg-cyan-600',
    },
    {
      icon: BookMarked,
      label: 'Peminjaman',
      description: 'Kelola peminjaman buku',
      onClick: () => router.push('/borrowings'),
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      icon: Clock,
      label: 'Riwayat Aktivitas',
      description: 'Log aktivitas sistem',
      onClick: () => router.push('/activity-logs'),
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      icon: Settings,
      label: 'Pengaturan',
      description: 'Konfigurasi sistem',
      onClick: () => router.push('/settings'),
      color: 'bg-gray-500 hover:bg-gray-600',
    },
  ];

  const stats = [
    {
      icon: TrendingUp,
      label: 'Aktivitas Hari Ini',
      value: '0',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: Calendar,
      label: 'Peminjaman Aktif',
      value: '0',
      color: 'text-green-600 dark:text-green-400',
    },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white dark:bg-gray-900`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {stat.label}
                  </p>
                  <p className={`text-xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex-1 space-y-2 overflow-y-auto">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant="outline"
              className="w-full justify-start h-auto py-3 px-3 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`p-2 rounded-lg ${action.color} flex-shrink-0`}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {action.description}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
