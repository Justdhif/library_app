'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Book } from '@/lib/types/api';
import { Pencil, Trash2, BookOpen, Star, Calendar, Building2, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface BooksTableRowProps {
  book: Book;
  onDelete: (book: Book) => void;
}

export function BooksTableRow({ book, onDelete }: BooksTableRowProps) {
  return (
    <Card className="group hover:shadow-xl transition-all overflow-hidden border hover:border-emerald-300 pt-0">
      {/* Cover Image - Reduced height */}
      <div className="relative aspect-3/4 overflow-hidden bg-muted">
        {book.cover_image ? (
          <Image
            src={book.cover_image}
            alt={book.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--brand-primary-light), var(--brand-primary-dark))' }}>
            <BookOpen className="h-12 w-12 text-white opacity-50" />
          </div>
        )}
        
        {/* Compact Badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          {book.is_featured && (
            <Badge className="bg-yellow-500 hover:bg-yellow-600 shadow-md text-[10px] px-1.5 py-0.5">
              <Star className="h-2.5 w-2.5 mr-0.5 fill-white" />
              Featured
            </Badge>
          )}
          <Badge
            variant={book.available_copies > 0 ? 'default' : 'destructive'}
            className={`${book.available_copies > 0 ? 'bg-green-500 hover:bg-green-600' : ''} shadow-md text-[10px] px-1.5 py-0.5 ml-auto`}
          >
            {book.available_copies > 0 ? 'Tersedia' : 'Dipinjam'}
          </Badge>
        </div>
      </div>

      {/* Book Info - Compact */}
      <CardContent className="p-3 space-y-2">
        {/* Title - Reduced line clamp */}
        <h3 className="font-bold text-sm line-clamp-2 group-hover:text-emerald-600 transition-colors min-h-10 leading-tight">
          {book.title}
        </h3>

        {/* ISBN - More compact */}
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-gray-50 dark:bg-gray-800 rounded px-1.5 py-1">
          <BookOpen className="h-3 w-3 shrink-0" />
          <span className="font-mono truncate">{book.isbn}</span>
        </div>

        {/* Categories - Single row with scroll */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {book.categories && book.categories.length > 0 ? (
            <>
              {book.categories.slice(0, 2).map((category) => (
                <Badge
                  key={category.id}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 shrink-0"
                >
                  {category.name}
                </Badge>
              ))}
              {book.categories.length > 2 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 shrink-0">
                  +{book.categories.length - 2}
                </Badge>
              )}
            </>
          ) : (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              No category
            </Badge>
          )}
        </div>

        {/* Publisher & Year - Inline compact */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {book.publisher && (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <Building2 className="h-3 w-3 shrink-0 text-gray-400 dark:text-gray-500" />
              <span className="truncate">{book.publisher.name}</span>
            </div>
          )}
          {book.publication_year && (
            <div className="flex items-center gap-1 shrink-0">
              <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
              <span>{book.publication_year}</span>
            </div>
          )}
        </div>

        {/* Copies Info & Actions - Compact footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm">
            <span className="font-bold text-emerald-600">{book.available_copies}</span>
            <span className="text-muted-foreground font-medium text-xs">/{book.total_copies}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-0.5">
            <Link href={`/books/${book.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(book);
              }}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
