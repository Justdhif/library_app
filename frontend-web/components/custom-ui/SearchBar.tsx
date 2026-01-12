'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCcw, Download } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  placeholder?: string;
  showExport?: boolean;
  onExport?: () => void;
}

export function SearchBar({ 
  searchQuery, 
  onSearchChange, 
  onRefresh,
  placeholder = "Cari data...",
  showExport = false,
  onExport
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      {showExport && onExport && (
        <Button 
          variant="outline"
          onClick={onExport}
          className="hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      )}
      <Button 
        variant="outline" 
        size="icon"
        onClick={onRefresh}
        className="hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
      >
        <RefreshCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
