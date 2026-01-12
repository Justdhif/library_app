'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, BookOpen, BookCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { isHoliday, getHolidayName } from '@/lib/holidays';
import { Skeleton } from '@/components/ui/skeleton';

interface DayData {
  date: string;
  day: number;
  dayName: string;
  borrowings: number;
  returns: number;
}

interface CalendarData {
  year: number;
  month: number;
  monthName: string;
  days: DayData[];
}

export function StatisticsCalendar() {
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const response = await apiClient.get('/dashboard/calendar-stats', {
        params: { year, month },
      });
      
      if (response.data.success) {
        setCalendarData(response.data.data);
      }
    } catch (error) {
      toast.error('Gagal memuat data kalender');
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(null);
  };

  const getFirstDayOfMonth = () => {
    if (!calendarData) return 0;
    const firstDate = new Date(calendarData.year, calendarData.month - 1, 1);
    return firstDate.getDay(); // 0 = Sunday, 6 = Saturday
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  const isSunday = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getDay() === 0; // 0 = Sunday
  };

  const isNationalHoliday = (dateStr: string) => {
    const date = new Date(dateStr);
    return isHoliday(date);
  };

  const getHolidayTitle = (dateStr: string) => {
    const date = new Date(dateStr);
    return getHolidayName(date);
  };

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-80" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Month Navigation Skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-10" />
          </div>

          {/* Days of Week Skeleton */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>

          {/* Calendar Grid Skeleton */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>

          {/* Legend Skeleton */}
          <div className="flex gap-4 justify-center flex-wrap pt-4 border-t">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!calendarData) return null;

  const daysInWeek = ['Ming', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const firstDayOfMonth = getFirstDayOfMonth();
  const emptySlots = Array(firstDayOfMonth).fill(null);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Kalender Statistik Peminjaman & Pengembalian
            </CardTitle>
            <CardDescription className="mt-1">
              Pantau aktivitas harian perpustakaan
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hari Ini
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-y-auto">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {calendarData.monthName} {calendarData.year}
          </h3>
          <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Days of Week Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {daysInWeek.map((day, idx) => (
            <div
              key={day}
              className={cn(
                "text-center text-sm font-semibold py-2",
                idx === 0 ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty Slots */}
          {emptySlots.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 opacity-30" />
          ))}

          {/* Calendar Days */}
          {calendarData.days.map((dayData) => {
            const today = isToday(dayData.day);
            const hasActivity = dayData.borrowings > 0 || dayData.returns > 0;
            const isSelected = selectedDay?.date === dayData.date;
            const isBoth = isSelected && today;
            const sunday = isSunday(dayData.date);
            const holiday = isNationalHoliday(dayData.date);
            const holidayName = getHolidayTitle(dayData.date);
            const isRedDate = sunday || holiday; // Tanggal merah (minggu atau libur nasional)

            // Determine background color based on state
            let bgClass = "";
            
            // Override for today or selected
            if (isBoth) {
              bgClass = "bg-gradient-to-br from-blue-400 to-blue-300 border-blue-600";
            } else if (today) {
              bgClass = "bg-gradient-to-br from-blue-300 to-blue-200 border-blue-500";
            } else if (isSelected) {
              bgClass = "bg-[#7FA6CC] border-[#4C9AE8]";
            } else if (isRedDate) {
              bgClass = "bg-[#FFC8C8]"; // Sunday or holiday - light red
            } else {
              bgClass = "bg-[#a9d2ff]"; // Default - light blue
            }

            return (
              <div
                key={dayData.date}
                onClick={() => {
                  setSelectedDay(dayData);
                  setIsDialogOpen(true);
                }}
                title={holidayName || undefined}
                className={cn(
                  'aspect-square rounded-lg p-2 relative cursor-pointer border transition-colors',
                  bgClass,
                  today || isSelected ? 'border-2' : 'border border-gray-200 dark:border-gray-700'
                )}
              >
                {/* Day Number */}
                <div className={cn(
                  "text-sm font-semibold w-full text-center",
                  isRedDate ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-200"
                )}>
                  {dayData.day}
                </div>

                {/* Holiday Indicator */}
                {holiday && (
                  <div className="absolute top-1 left-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  </div>
                )}

                {/* Activity Label at Bottom */}
                {hasActivity && (
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className="text-[9px] px-1 py-0.5 rounded text-center truncate font-medium bg-blue-600 text-white">
                      {dayData.borrowings > 0 && `📚 ${dayData.borrowings}`}
                      {dayData.borrowings > 0 && dayData.returns > 0 && ' • '}
                      {dayData.returns > 0 && `✓ ${dayData.returns}`}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#a9d2ff] border" />
            <span>Hari Biasa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#FFC8C8] border relative">
              <div className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full bg-red-500" />
            </div>
            <span>Hari Libur/Minggu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-300 to-blue-200 border border-blue-500" />
            <span>Hari Ini</span>
          </div>
        </div>
      </CardContent>

      {/* Dialog for Selected Day Details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedDay && calendarData && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  {selectedDay.dayName}, {selectedDay.day} {calendarData.monthName} {calendarData.year}
                </DialogTitle>
                <DialogDescription>
                  Detail aktivitas perpustakaan pada tanggal ini
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-3">
                      <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {selectedDay.borrowings}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                      Peminjaman
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                    <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full mb-3">
                      <BookCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {selectedDay.returns}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                      Pengembalian
                    </p>
                  </div>
                </div>

                {/* Total Activity */}
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Aktivitas
                    </span>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {selectedDay.borrowings + selectedDay.returns}
                    </span>
                  </div>
                </div>

                {/* Close Button */}
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  variant="outline"
                  className="w-full"
                >
                  Tutup
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
