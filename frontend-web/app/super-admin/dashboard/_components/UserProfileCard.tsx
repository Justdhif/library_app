'use client';

import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Shield, Mail, Calendar, Phone, MapPin, User, Clock } from 'lucide-react';

export function UserProfileCard() {
  const { user } = useAuth();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col pt-0">
      <div className="h-24 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600" />
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex items-start gap-4 -mt-16">
          <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800">
            <AvatarImage 
              src={user.profile?.avatar || undefined} 
              alt={user.profile?.full_name || user.username} 
            />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl font-semibold">
              {getInitials(user.profile?.full_name || user.username)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 pt-12">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {user.profile?.full_name || user.username}
              </h2>
              <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">
                <Shield className="h-3 w-3 mr-1" />
                Super Admin
              </Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              @{user.username}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.email}</p>
            </div>
          </div>

          {user.profile?.phone && (
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.profile.phone}</p>
              </div>
            </div>
          )}

          {user.profile?.address && (
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{user.profile.address}</p>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="pt-2 border-t space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4" />
              <span>User ID</span>
            </div>
            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-gray-100">#{user.id}</span>
          </div>

          {user.created_at && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Joined</span>
              </div>
              <span className="text-gray-900 dark:text-gray-100 font-medium">{formatDate(user.created_at)}</span>
            </div>
          )}

          {user.email_verified_at && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Verified</span>
              </div>
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                ✓ Verified
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Shield className="h-4 w-4" />
              <span>Status</span>
            </div>
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
              ● Active
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
