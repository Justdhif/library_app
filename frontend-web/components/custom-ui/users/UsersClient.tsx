'use client';

import { useEffect, useState } from 'react';
import { usersApi } from '@/lib/api';
import { User } from '@/lib/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { StatsCards, StatCardData, SearchBar, Pagination } from '@/components/custom-ui';
import { Users, UserCheck, UserX } from 'lucide-react';
import { UsersTable } from './UsersTable';
import { PreviewCard } from './PreviewCard';
import { useLanguage } from '@/lib/language-context';

export function UsersClient() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const perPage = 10;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users when page or debounced search changes
  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearchQuery]);

  // ESC key handler to close preview
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedUser) {
        setSelectedUser(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll({
        page,
        per_page: perPage,
        search: debouncedSearchQuery || undefined,
      });
      
      setUsers(Array.isArray(response.data) ? response.data : []);
      setTotal(response.total || 0);
    } catch (error: any) {
      toast.error(t('users.failedLoadUsers'), {
        description: error.response?.data?.message || t('users.errorOccurred'),
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (user: User) => {
    setSelectedUser(user);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / perPage);
  const activeCount = Array.isArray(users) ? users.filter(u => u.status === 'active').length : 0;
  const inactiveCount = Array.isArray(users) ? users.filter(u => u.status === 'inactive').length : 0;

  const stats: StatCardData[] = [
    {
      title: t('users.totalUsers'),
      value: total,
      description: t('users.pageOf').replace('{page}', String(page)).replace('{total}', String(totalPages || 1)),
      icon: Users,
      gradient: true,
    },
    {
      title: t('users.activeUsers'),
      value: activeCount,
      description: t('users.currentlyActive'),
      icon: UserCheck,
      iconColor: 'text-green-600',
      textColor: 'text-green-600',
    },
    {
      title: t('users.inactiveUsers'),
      value: inactiveCount,
      description: t('users.currentlyInactive'),
      icon: UserX,
      iconColor: 'text-red-600',
      textColor: 'text-red-600',
    },
  ];

  return (
    <>
      <StatsCards stats={stats} columns={3} />

      <div className="flex gap-6">
        {/* Table Section */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>{t('users.userList')}</CardTitle>
              <CardDescription>
                {t('users.searchAndManage')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onRefresh={fetchUsers}
                placeholder={t('users.searchPlaceholder')}
              />

              <UsersTable
                users={users}
                loading={loading}
                onPreview={handlePreview}
              />

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                total={total}
                perPage={perPage}
                onPageChange={setPage}
                itemLabel="users"
              />
            </CardContent>
          </Card>
        </div>

        {/* Preview Card Section */}
        <PreviewCard 
          selectedUser={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      </div>
    </>
  );
}
