'use client';

import { User } from '@/lib/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { X, Phone, Mail as MailIcon, CreditCard, User as UserIcon } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface PreviewCardProps {
  selectedUser: User | null;
  onClose: () => void;
}

export function PreviewCard({ selectedUser, onClose }: PreviewCardProps) {
  const { t } = useLanguage();
  // Get role colors
  const getRoleColors = (roleName?: string) => {
    switch (roleName) {
      case 'super-admin':
        return {
          header: 'from-emerald-700 via-emerald-600 to-emerald-500',
          badge: 'from-emerald-100 to-emerald-200 border-emerald-300',
          badgeDot: 'bg-emerald-600',
          badgeText: 'text-emerald-800',
          email: 'from-emerald-600 to-emerald-500',
          username: 'from-emerald-500 to-emerald-400',
          phone: 'from-emerald-500 to-teal-500',
          button: 'from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600',
        };
      case 'admin':
        return {
          header: 'from-emerald-600 via-emerald-500 to-teal-500',
          badge: 'from-emerald-100 to-teal-100 border-emerald-300',
          badgeDot: 'bg-emerald-500',
          badgeText: 'text-emerald-700',
          email: 'from-emerald-500 to-teal-500',
          username: 'from-emerald-400 to-teal-400',
          phone: 'from-teal-500 to-cyan-500',
          button: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
        };
      case 'librarian':
        return {
          header: 'from-emerald-600 via-teal-600 to-cyan-600',
          badge: 'from-emerald-100 to-teal-100 border-emerald-300',
          badgeDot: 'bg-emerald-500',
          badgeText: 'text-emerald-700',
          email: 'from-emerald-500 to-teal-500',
          username: 'from-emerald-400 to-teal-400',
          phone: 'from-teal-500 to-cyan-500',
          button: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
        };
      default: // member
        return {
          header: 'from-emerald-600 via-emerald-500 to-emerald-400',
          badge: 'from-emerald-100 to-emerald-200 border-emerald-300',
          badgeDot: 'bg-emerald-500',
          badgeText: 'text-emerald-700',
          email: 'from-emerald-500 to-teal-500',
          username: 'from-emerald-400 to-teal-400',
          phone: 'from-teal-500 to-emerald-500',
          button: 'from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600',
        };
    }
  };

  const colors = getRoleColors(selectedUser?.profile?.role);

  return (
    <div className="w-[380px] shrink-0">
      <Card className="sticky top-6 overflow-hidden flex flex-col">
        <CardHeader className="border-b mb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <div>
                <CardTitle className="text-base">{t('users.previewCard')}</CardTitle>
                <CardDescription className="text-xs">
                  {t('users.libraryIdentityCard')}
                </CardDescription>
              </div>
            </div>
            {selectedUser && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-y-auto">
          {selectedUser ? (
            /* Library Identity Card */
            <div className="relative h-full">
              {/* Header with Logo Pattern */}
              <div className={`h-32 relative overflow-hidden bg-gradient-to-br ${colors.header}`}>
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20" />
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20" />
                </div>
                
                {/* Library Logo/Text */}
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-2 text-white">
                    <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{t('users.libraryApp')}</p>
                      <p className="text-[10px] opacity-90">{t('users.memberIdCard')}</p>
                    </div>
                  </div>
                </div>

                {/* Card Number */}
                <div className="absolute bottom-4 left-4">
                  <p className="text-[10px] text-white/70 font-medium mb-1">{t('users.cardNo')}</p>
                  <p className="text-sm font-bold text-white tracking-wider">
                    LIB-{selectedUser.id.toString().padStart(6, '0')}
                  </p>
                </div>
              </div>

              {/* Avatar positioned on gradient */}
              <div className="absolute top-20 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <div className="h-28 w-28 rounded-2xl bg-white p-1.5 shadow-xl">
                    <Avatar className="h-full w-full rounded-xl">
                      <AvatarImage
                        src={selectedUser.profile?.avatar}
                        alt={selectedUser.username}
                        className="object-cover"
                      />
                      <AvatarFallback>{selectedUser.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  {/* Status Badge */}
                  <div className={`absolute -bottom-2 -right-2 px-2 py-1 rounded-full text-[10px] font-bold shadow-lg ${
                    selectedUser.status === 'active' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {selectedUser.status === 'active' ? t('users.active') : t('users.inactive')}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="pt-20 pb-6 px-6 space-y-4">
                {/* Name & Role */}
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedUser.profile?.full_name || selectedUser.username}
                  </h3>
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 bg-gradient-to-r ${colors.badge}`}>
                    <div className={`h-2 w-2 rounded-full animate-pulse ${colors.badgeDot}`} />
                    <span className={`text-sm font-bold ${colors.badgeText}`}>
                      {selectedUser.profile?.role || 'member'}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-dashed border-gray-200" />

                {/* Info Grid */}
                <div className="space-y-3">
                  {/* Email */}
                  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-md bg-gradient-to-br ${colors.email}`}>
                      <MailIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('users.emailAddress')}</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{selectedUser.email}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-md bg-gradient-to-br ${colors.phone}`}>
                      <Phone className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('users.phoneNumber')}</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedUser.profile?.phone || t('users.notAvailable')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <Button
                    className={`w-full text-white font-semibold shadow-lg bg-gradient-to-r ${colors.button}`}
                    size="lg"
                    onClick={() => window.location.href = `/users/${selectedUser.id}`}
                  >
                    {t('users.viewFullDetails')}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Fallback State */
            <div className="p-8 space-y-6">
              {/* Empty State Illustration */}
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <CreditCard className="h-16 w-16 text-gray-400" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold text-gray-900">{t('users.noCardSelected')}</h3>
                  <p className="text-sm text-gray-500 max-w-xs">
                    {t('users.clickPreviewIcon')}
                  </p>
                </div>
              </div>

              {/* Sample Card Preview */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <UserIcon className="h-4 w-4" />
                  <p className="text-xs font-semibold">{t('users.cardPreview')}</p>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
