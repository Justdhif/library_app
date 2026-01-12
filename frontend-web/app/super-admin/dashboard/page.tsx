'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/language-context';
import { UserProfileCard } from './_components/UserProfileCard';
import { LibraryHoursSettings } from './_components/LibraryHoursSettings';
import { StatisticsCalendar } from './_components/StatisticsCalendar';
import { QuickActions } from './_components/QuickActions';
import { OperationalStatusBanner } from '@/components/custom-ui';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  // No need to refresh user on mount, AuthContext already handles it

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Operational Status Banner */}
      <OperationalStatusBanner />

      {/* Section 1: Profile & Library Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card - 1/3 width */}
        <div className="lg:col-span-1 h-full">
          <UserProfileCard />
        </div>

        {/* Library Hours Settings - 2/3 width */}
        <div className="lg:col-span-2 h-full">
          <LibraryHoursSettings />
        </div>
      </div>

      {/* Section 2: Calendar & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics Calendar - 2/3 width */}
        <div className="lg:col-span-2 h-full">
          <StatisticsCalendar />
        </div>

        {/* Quick Actions - 1/3 width */}
        <div className="lg:col-span-1 h-full">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}