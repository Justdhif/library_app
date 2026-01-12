'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useLibraryOperational } from '@/hooks/use-library-operational';
import { useLanguage } from '@/lib/language-context';

export function OperationalStatusBanner() {
  const { isOperational, isLoading, reason, openingTime, closingTime, nextOpenTime } = useLibraryOperational();
  const { t } = useLanguage();

  // Don't show banner until data is loaded
  if (!openingTime || !closingTime) {
    return null;
  }
  
  if (isOperational) {
    return (
      <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-900 dark:text-green-100">
          {t('dashboard.operationalStatus.open')}
        </AlertTitle>
        <AlertDescription className="text-green-800 dark:text-green-200 mt-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              {t('dashboard.operationalStatus.operatingHours')}: {openingTime} - {closingTime}
            </span>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      <AlertTitle className="text-red-900 dark:text-red-100">
        {t('dashboard.operationalStatus.closed')}
      </AlertTitle>
      <AlertDescription className="text-red-800 dark:text-red-200 mt-2 space-y-2">
        <p>{reason}</p>
        {nextOpenTime && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>{t('dashboard.operationalStatus.nextOpen').replace('{time}', nextOpenTime)}</span>
          </div>
        )}
        <p className="text-sm font-medium mt-2">
          {t('dashboard.operationalStatus.cannotBorrow')}
        </p>
      </AlertDescription>
    </Alert>
  );
}
