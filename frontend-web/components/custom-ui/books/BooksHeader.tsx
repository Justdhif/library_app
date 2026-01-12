'use client';

import { Button } from '@/components/ui/button';
import { BookPlus } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';

export function BooksHeader() {
  const { t } = useLanguage();
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{t('books.title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('books.manageDescription')}
        </p>
      </div>
      <Link href="/books/add">
        <Button className="bg-emerald-600 hover:bg-emerald-700" style={{ backgroundColor: 'var(--brand-primary-dark)' }}>
          <BookPlus className="mr-2 h-4 w-4" />
          {t('books.addBook')}
        </Button>
      </Link>
    </div>
  );
}
