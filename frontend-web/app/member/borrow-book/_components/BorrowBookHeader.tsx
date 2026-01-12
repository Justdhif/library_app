'use client';

import { BookOpen } from 'lucide-react';

export function BorrowBookHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
        <BookOpen className="h-6 w-6 text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pinjam Buku</h1>
        <p className="text-muted-foreground">
          Ajukan peminjaman buku yang Anda inginkan
        </p>
      </div>
    </div>
  );
}
