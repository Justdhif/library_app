'use client';

import { User } from '@/lib/types/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Eye, Pencil, Trash2, Mail, Calendar, Shield } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';

interface UsersTableRowProps {
  user: User;
  onPreview: (user: User) => void;
}

const getRoleBadgeColor = (roleName?: string) => {
  switch (roleName?.toLowerCase()) {
    case 'super-admin':
      return 'bg-emerald-600';
    case 'admin':
      return 'bg-emerald-500';
    case 'librarian':
      return 'bg-green-500';
    case 'member':
      return 'bg-emerald-400';
    default:
      return 'bg-gray-500';
  }
};

export function UsersTableRow({ user, onPreview }: UsersTableRowProps) {
  const { t } = useLanguage();
  
  return (
    <tr className="hover:bg-muted/30">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user.profile?.avatar}
                alt={user.username}
              />
              <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {/* Status Indicator */}
            <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
              user.status === 'active' ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
          <div>
            <div className="font-medium">
              {user.profile?.full_name || user.username}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '-'}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            {user.email}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            @{user.username}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge className={getRoleBadgeColor(user.profile?.role)}>
          <Shield className="mr-1 h-3 w-3" />
          {user.profile?.role?.replace('-', ' ') || t('users.noRole')}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onPreview(user)}
            title={t('users.preview')}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Link href={`/users/${user.id}`}>
            <Button size="sm" variant="ghost" title={t('users.detail')}>
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  );
}
