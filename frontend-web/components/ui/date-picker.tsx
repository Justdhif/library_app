"use client"

import * as React from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  disablePast?: boolean
  disableFuture?: boolean
}

export function DatePicker({ 
  date, 
  onDateChange, 
  placeholder = "Pilih tanggal", 
  disabled = false,
  minDate,
  maxDate,
  disablePast = false,
  disableFuture = false
}: DatePickerProps) {
  const getDisabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (disablePast && date < today) return true;
    if (disableFuture && date > today) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    
    return false;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal hover:bg-emerald-50 hover:border-emerald-300 transition-colors",
            !date && "text-muted-foreground",
            date && "border-emerald-200 bg-emerald-50/30"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
          {date ? format(date, "PPP", { locale: id }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          disabled={getDisabledDates}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
