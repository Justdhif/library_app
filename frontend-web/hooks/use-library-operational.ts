import { useState, useEffect, useRef } from 'react';
import apiClient from '@/lib/api/client';
import { toast } from 'sonner';

interface LibrarySettings {
  operating_hours_mode: { value: string };
  opening_time: { value: string };
  closing_time: { value: string };
  closed_on_holidays: { value: boolean };
  closed_on_weekends: { value: boolean };
  custom_closed_days: { value: number[] };
}

interface OperationalStatus {
  isOperational: boolean;
  isLoading: boolean;
  reason?: string;
  openingTime?: string;
  closingTime?: string;
  nextOpenTime?: string;
}

/**
 * Hook untuk mengecek status operasional perpustakaan
 * Menggunakan waktu Indonesia (WIB = UTC+7)
 */
export function useLibraryOperational(): OperationalStatus {
  const [status, setStatus] = useState<OperationalStatus>({
    isOperational: true,
    isLoading: true,
  });
  
  // Track if warning toast has been shown to avoid spam
  const warningShownRef = useRef(false);
  const lastCheckTimeRef = useRef<string>('');

  useEffect(() => {
    // Global flag to prevent multiple hook instances from running simultaneously
    const GLOBAL_FLAG = '__library_operational_active__';
    
    // If another instance is already running, skip this one
    if ((window as any)[GLOBAL_FLAG]) {
      return;
    }
    
    // Mark this instance as active
    (window as any)[GLOBAL_FLAG] = true;

    let intervalId: NodeJS.Timeout;

    // Check if warning was already shown in this session
    const warningShownInSession = sessionStorage.getItem('library-warning-shown');
    if (warningShownInSession) {
      warningShownRef.current = true;
    }

    const checkOperationalStatus = async () => {
      try {
        const response = await apiClient.get('/settings');
        
        if (response.data.success) {
          const settings: LibrarySettings = response.data.data;
          const result = calculateOperationalStatus(settings);
          setStatus(result);
          
          // Check if we need to show 1-hour warning
          const now = new Date();
          const wibOffset = 7 * 60;
          const localOffset = now.getTimezoneOffset();
          const wibTime = new Date(now.getTime() + (wibOffset + localOffset) * 60000);
          const currentTimeStr = `${String(wibTime.getHours()).padStart(2, '0')}:${String(wibTime.getMinutes()).padStart(2, '0')}`;
          
          // Only check if library is currently open
          if (result.isOperational && result.closingTime) {
            const currentMinutes = timeToMinutes(currentTimeStr);
            const closingMinutes = timeToMinutes(result.closingTime);
            const timeUntilClose = closingMinutes - currentMinutes;
            
            // Show warning if 1 hour (60 minutes) or less until closing
            // and we haven't shown it yet for this time period
            if (timeUntilClose <= 60 && timeUntilClose > 0) {
              // Reset warning if time has changed significantly (e.g., after settings update)
              if (lastCheckTimeRef.current !== result.closingTime) {
                warningShownRef.current = false;
                sessionStorage.removeItem('library-warning-shown');
                lastCheckTimeRef.current = result.closingTime;
              }
              
              if (!warningShownRef.current) {
                const hours = Math.floor(timeUntilClose / 60);
                const minutes = timeUntilClose % 60;
                const timeText = hours > 0 
                  ? `${hours} jam ${minutes} menit`
                  : `${minutes} menit`;
                
                toast.warning('⚠️ Perpustakaan Akan Segera Tutup', {
                  description: `Perpustakaan akan tutup dalam ${timeText} (pukul ${result.closingTime} WIB). Harap selesaikan transaksi Anda.`,
                  duration: 10000,
                });
                
                warningShownRef.current = true;
                sessionStorage.setItem('library-warning-shown', 'true');
              }
            } else if (timeUntilClose > 60) {
              // Reset warning if we're more than 1 hour away (e.g., after midnight or settings change)
              warningShownRef.current = false;
              sessionStorage.removeItem('library-warning-shown');
            }
          }
        }
      } catch (error: any) {
        // Don't log 401 errors as they're handled by API client auto-logout
        if (error?.response?.status !== 401) {
          console.error('[useLibraryOperational] Failed to fetch settings:', error);
        }
        // Default ke operational jika ada error (kecuali 401 yang akan redirect)
        if (error?.response?.status !== 401) {
          setStatus({
            isOperational: true,
            isLoading: false,
            reason: 'Unable to verify operational status',
          });
        }
      }
    };

    // Check immediately
    checkOperationalStatus();

    // Check setiap 1 menit untuk update real-time
    intervalId = setInterval(checkOperationalStatus, 60000);
    
    // Listen for settings update event to immediately re-check
    const handleSettingsUpdate = () => {
      // Reset warning flag on settings update
      warningShownRef.current = false;
      sessionStorage.removeItem('library-warning-shown');
      checkOperationalStatus();
    };
    window.addEventListener('library-settings-updated', handleSettingsUpdate);

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('library-settings-updated', handleSettingsUpdate);
      // Clear global flag when hook unmounts
      delete (window as any)[GLOBAL_FLAG];
    };
  }, []);

  return status;
}

/**
 * Calculate operational status based on settings and current time (WIB)
 */
function calculateOperationalStatus(settings: LibrarySettings): OperationalStatus {
  // Get current time in WIB (UTC+7)
  const now = new Date();
  const wibOffset = 7 * 60; // WIB = UTC+7 in minutes
  const localOffset = now.getTimezoneOffset(); // Local offset in minutes (negative for ahead of UTC)
  const wibTime = new Date(now.getTime() + (wibOffset + localOffset) * 60000);
  
  const currentDay = wibTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const currentTime = `${String(wibTime.getHours()).padStart(2, '0')}:${String(wibTime.getMinutes()).padStart(2, '0')}`;
  
  const mode = settings.operating_hours_mode.value;
  const openingTime = settings.opening_time.value;
  const closingTime = settings.closing_time.value;
  const closedOnWeekends = settings.closed_on_weekends.value;
  const customClosedDays = settings.custom_closed_days.value || [];

  // Check if today is in custom closed days
  if (customClosedDays.includes(currentDay)) {
    return {
      isOperational: false,
      isLoading: false,
      reason: 'Library is closed today (custom schedule)',
      openingTime,
      closingTime,
      nextOpenTime: getNextOpenTime(currentDay, customClosedDays, openingTime, mode, closedOnWeekends),
    };
  }

  // Check operating mode
  if (mode === 'custom') {
    // Custom mode: check custom_closed_days
    return checkTimeRange(currentTime, openingTime, closingTime);
  } else if (mode === 'weekdays') {
    // Weekdays only: Monday-Friday
    if (currentDay === 0 || currentDay === 6) {
      return {
        isOperational: false,
        isLoading: false,
        reason: 'Library is closed on weekends',
        openingTime,
        closingTime,
        nextOpenTime: 'Monday ' + openingTime,
      };
    }
    return checkTimeRange(currentTime, openingTime, closingTime);
  } else if (mode === 'everyday') {
    // Everyday mode: check if weekend closure is enabled
    if (closedOnWeekends && (currentDay === 0 || currentDay === 6)) {
      return {
        isOperational: false,
        isLoading: false,
        reason: 'Library is closed on weekends',
        openingTime,
        closingTime,
        nextOpenTime: 'Monday ' + openingTime,
      };
    }
    return checkTimeRange(currentTime, openingTime, closingTime);
  }

  // Default: operational
  return {
    isOperational: true,
    isLoading: false,
    openingTime,
    closingTime,
  };
}

/**
 * Check if current time is within operational hours
 */
function checkTimeRange(currentTime: string, openingTime: string, closingTime: string): OperationalStatus {
  const current = timeToMinutes(currentTime);
  const opening = timeToMinutes(openingTime);
  const closing = timeToMinutes(closingTime);

  if (current < opening) {
    return {
      isOperational: false,
      isLoading: false,
      reason: `Library opens at ${openingTime}`,
      openingTime,
      closingTime,
      nextOpenTime: openingTime,
    };
  }

  if (current >= closing) {
    return {
      isOperational: false,
      isLoading: false,
      reason: `Library is closed (closes at ${closingTime})`,
      openingTime,
      closingTime,
      nextOpenTime: 'Tomorrow ' + openingTime,
    };
  }

  return {
    isOperational: true,
    isLoading: false,
    openingTime,
    closingTime,
  };
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Get next open time message
 */
function getNextOpenTime(
  currentDay: number,
  closedDays: number[],
  openingTime: string,
  mode: string,
  closedOnWeekends: boolean
): string {
  // Find next open day
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    
    // Check if next day is closed
    if (closedDays.includes(nextDay)) continue;
    if (mode === 'weekdays' && (nextDay === 0 || nextDay === 6)) continue;
    if (closedOnWeekends && (nextDay === 0 || nextDay === 6)) continue;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return i === 1 ? 'Tomorrow ' + openingTime : dayNames[nextDay] + ' ' + openingTime;
  }

  return 'Please check schedule';
}
