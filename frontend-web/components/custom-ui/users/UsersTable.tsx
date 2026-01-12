'use client';

import { User } from '@/lib/types/api';
import { TableSkeleton } from './TableSkeleton';
import { UsersTableRow } from './UsersTableRow';
import { EmptyState } from '@/components/custom-ui';
import { Users } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface UsersTableProps {
  users: User[];
  loading: boolean;
  onPreview: (user: User) => void;
}

export function UsersTable({ users, loading, onPreview }: UsersTableProps) {
  const { t } = useLanguage();
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">{t('users.user')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium">{t('users.email')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium">{t('users.role')}</th>
              <th className="px-4 py-3 text-right text-sm font-medium">{t('users.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <TableSkeleton />
            ) : !Array.isArray(users) || users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-0">
                  <EmptyState
                    icon={Users}
                    title={t('users.noUsers')}
                    description={t('users.noUsersDescription')}
                  />
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UsersTableRow key={user.id} user={user} onPreview={onPreview} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
