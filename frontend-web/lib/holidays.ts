import Holidays from 'date-holidays';

// Initialize holidays instance for Indonesia
const hd = new Holidays('ID'); // ID = Indonesia

// Function to check if a date is a holiday
export function isHoliday(date: Date): boolean {
  const holidays = hd.isHoliday(date);
  return holidays !== false && holidays !== undefined;
}

// Function to get all holidays for a specific year
export function getHolidaysForYear(year: number): Array<{ date: Date; name: string }> {
  const holidays = hd.getHolidays(year);
  return holidays.map(holiday => ({
    date: new Date(holiday.date),
    name: holiday.name
  }));
}

// Function to check if a date is weekend (Saturday or Sunday)
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

// Function to get holiday name if exists
export function getHolidayName(date: Date): string | null {
  const holidays = hd.isHoliday(date);
  if (holidays && Array.isArray(holidays) && holidays.length > 0) {
    return holidays[0].name;
  }
  return null;
}
