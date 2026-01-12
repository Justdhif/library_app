'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';
import { useLanguage } from '@/lib/language-context';

interface LibrarySettings {
  operating_hours_mode: { value: string };
  opening_time: { value: string };
  closing_time: { value: string };
  closed_on_holidays: { value: boolean };
  closed_on_weekends: { value: boolean };
  custom_closed_days: { value: number[] };
}

export function LibraryHoursSettings() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState('weekdays');
  const [openingTime, setOpeningTime] = useState('08:00');
  const [closingTime, setClosingTime] = useState('17:00');
  const [closedOnHolidays, setClosedOnHolidays] = useState(true);
  const [closedOnWeekends, setClosedOnWeekends] = useState(true);
  const [customClosedDays, setCustomClosedDays] = useState<number[]>([]);

  const daysOfWeek = [
    { value: 0, label: t('dashboard.libraryHoursSettings.sunday') },
    { value: 1, label: t('dashboard.libraryHoursSettings.monday') },
    { value: 2, label: t('dashboard.libraryHoursSettings.tuesday') },
    { value: 3, label: t('dashboard.libraryHoursSettings.wednesday') },
    { value: 4, label: t('dashboard.libraryHoursSettings.thursday') },
    { value: 5, label: t('dashboard.libraryHoursSettings.friday') },
    { value: 6, label: t('dashboard.libraryHoursSettings.saturday') },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/settings');
      console.log('[LibraryHoursSettings] Settings loaded:', response.data);
      
      if (response.data.success) {
        const settings: LibrarySettings = response.data.data;
        setMode(settings.operating_hours_mode.value);
        setOpeningTime(settings.opening_time.value);
        setClosingTime(settings.closing_time.value);
        setClosedOnHolidays(settings.closed_on_holidays.value);
        setClosedOnWeekends(settings.closed_on_weekends.value);
        setCustomClosedDays(settings.custom_closed_days.value);
      }
    } catch (error: any) {
      console.error('[LibraryHoursSettings] Failed to load settings:', error);
      const errorMsg = error.code === 'ERR_NETWORK' 
        ? t('dashboard.libraryHoursSettings.backendUnreachable')
        : error.response?.status === 401
        ? t('dashboard.libraryHoursSettings.sessionExpired')
        : t('dashboard.libraryHoursSettings.loadFailed');
      setError(errorMsg);
      // Don't show error toast on mount, use error state instead
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.put('/settings', {
        operating_hours_mode: mode,
        opening_time: openingTime,
        closing_time: closingTime,
        closed_on_holidays: closedOnHolidays,
        closed_on_weekends: closedOnWeekends,
        custom_closed_days: customClosedDays,
      });
      toast.success(t('dashboard.libraryHoursSettings.saveSuccess'));
      
      // Trigger a custom event to notify useLibraryOperational hook to re-check
      window.dispatchEvent(new CustomEvent('library-settings-updated'));
    } catch (error) {
      toast.error(t('dashboard.libraryHoursSettings.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const toggleCustomDay = (day: number) => {
    setCustomClosedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-64" />
          </div>
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Time inputs skeleton */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          
          {/* Radio options skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-1" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
            ))}
          </div>

          {/* Save button skeleton */}
          <div className="flex justify-end">
            <Skeleton className="h-10 w-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('dashboard.libraryHoursSettings.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <div className="text-red-500 dark:text-red-400">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-900 dark:text-gray-100 font-medium">{error}</p>
            </div>
            <Button onClick={loadSettings} variant="outline">
              {t('dashboard.libraryHoursSettings.tryAgain')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('dashboard.libraryHoursSettings.title')}
        </CardTitle>
        <CardDescription>
          {t('dashboard.libraryHoursSettings.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-y-auto">
        {/* Opening/Closing Times */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="opening-time">{t('dashboard.libraryHoursSettings.openingTime')}</Label>
            <Input
              id="opening-time"
              type="time"
              value={openingTime}
              onChange={(e) => setOpeningTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="closing-time">{t('dashboard.libraryHoursSettings.closingTime')}</Label>
            <Input
              id="closing-time"
              type="time"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
            />
          </div>
        </div>

        {/* Operating Mode */}
        <div className="space-y-3">
          <Label>{t('dashboard.libraryHoursSettings.operatingMode')}</Label>
          <RadioGroup value={mode} onValueChange={setMode}>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="custom" id="custom" className="mt-1" />
              <div className="space-y-1">
                <Label htmlFor="custom" className="font-medium cursor-pointer">
                  {t('dashboard.libraryHoursSettings.customDays')}
                </Label>
                <p className="text-sm text-gray-500">
                  {t('dashboard.libraryHoursSettings.customDaysDesc')}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="weekdays" id="weekdays" className="mt-1" />
              <div className="space-y-1">
                <Label htmlFor="weekdays" className="font-medium cursor-pointer">
                  {t('dashboard.libraryHoursSettings.weekdays')}
                </Label>
                <p className="text-sm text-gray-500">
                  {t('dashboard.libraryHoursSettings.weekdaysDesc')}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="everyday" id="everyday" className="mt-1" />
              <div className="space-y-1">
                <Label htmlFor="everyday" className="font-medium cursor-pointer">
                  {t('dashboard.libraryHoursSettings.everyday')}
                </Label>
                <p className="text-sm text-gray-500">
                  {t('dashboard.libraryHoursSettings.everydayDesc')}
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Custom Days Selection */}
        {mode === 'custom' && (
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Label>{t('dashboard.libraryHoursSettings.customClosedDays')}</Label>
            <div className="grid grid-cols-2 gap-3">
              {daysOfWeek.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={!customClosedDays.includes(day.value)}
                    onCheckedChange={() => toggleCustomDay(day.value)}
                  />
                  <Label
                    htmlFor={`day-${day.value}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekdays Mode Options */}
        {mode === 'weekdays' && (
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="holidays"
                  checked={closedOnHolidays}
                  onCheckedChange={(checked) => setClosedOnHolidays(checked as boolean)}
                />
                <Label htmlFor="holidays" className="text-sm font-medium cursor-pointer">
                  {t('dashboard.libraryHoursSettings.closedOnHolidays')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="weekends"
                  checked={closedOnWeekends}
                  onCheckedChange={(checked) => setClosedOnWeekends(checked as boolean)}
                />
                <Label htmlFor="weekends" className="text-sm font-medium cursor-pointer">
                  {t('dashboard.libraryHoursSettings.closedOnWeekends')}
                </Label>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving} className="min-w-[180px]">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('dashboard.libraryHoursSettings.saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('dashboard.libraryHoursSettings.saveSettings')}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
