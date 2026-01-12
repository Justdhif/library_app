'use client';

import { Book } from '@/lib/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, BookOpen, Star, Calendar, BookText, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface PreviewCardProps {
  book: Book | null;
  onClose: () => void;
}

export function PreviewCard({ book, onClose }: PreviewCardProps) {
  return (
    <div className="w-80 shrink-0">
      <Card className="sticky top-6">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">Book Preview</CardTitle>
            <p className="text-sm text-muted-foreground">Detail informasi buku</p>
          </div>
          {book && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {book ? (
            <>
              {/* Cover Image */}
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md">
                {book.cover_image ? (
                  <Image
                    src={book.cover_image}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--brand-primary-light), var(--brand-primary-dark))' }}>
                    <BookOpen className="h-16 w-16 text-white opacity-50" />
                  </div>
                )}
                {book.is_featured && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>

              {/* Book Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-lg line-clamp-2">{book.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {book.publisher?.name || 'Unknown Publisher'}
                  </p>
                </div>

                {/* ISBN */}
                <div className="flex items-start gap-2">
                  <BookText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">ISBN</p>
                    <p className="text-sm font-mono">{book.isbn}</p>
                  </div>
                </div>

                {/* Publication Year */}
                {book.publication_year && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Tahun Terbit</p>
                      <p className="text-sm">{book.publication_year}</p>
                    </div>
                  </div>
                )}

                {/* Language */}
                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Bahasa</p>
                    <p className="text-sm">{book.language}</p>
                  </div>
                </div>

                {/* Copies Status */}
                <div className="pt-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Eksemplar</span>
                    <span className="font-semibold">{book.total_copies}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tersedia</span>
                    <Badge
                      variant={book.available_copies > 0 ? 'default' : 'destructive'}
                      className={
                        book.available_copies > 0
                          ? 'bg-green-100 text-green-700'
                          : ''
                      }
                    >
                      {book.available_copies}
                    </Badge>
                  </div>
                </div>

                {/* Rating */}
                {book.average_rating && book.average_rating > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{book.average_rating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">
                          ({book.total_ratings} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                {book.description && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Deskripsi</p>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {book.description}
                    </p>
                  </div>
                )}

                {/* Categories */}
                {book.categories && book.categories.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Kategori</p>
                    <div className="flex flex-wrap gap-1">
                      {book.categories.map((category) => (
                        <Badge key={category.id} variant="secondary" className="text-xs">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Authors */}
                {book.authors && book.authors.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Penulis</p>
                    <div className="flex flex-wrap gap-1">
                      {book.authors.map((author) => (
                        <Badge key={author.id} variant="outline" className="text-xs">
                          {author.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Link href={`/books/${book.id}`} className="block">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" style={{ backgroundColor: 'var(--brand-primary-dark)' }}>
                  Lihat Detail Lengkap
                </Button>
              </Link>
            </>
          ) : (
            /* Empty State */
            <div className="py-8 space-y-4">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-purple-400" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-semibold text-gray-900">Tidak Ada Buku Dipilih</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Klik ikon preview pada buku untuk melihat detail lengkap di sini
                  </p>
                </div>
              </div>

              {/* Sample Preview */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <BookText className="h-4 w-4" />
                  <p className="text-xs font-medium">Book Preview</p>
                </div>
                <div className="space-y-2">
                  <div className="h-2.5 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-2.5 bg-gray-200 rounded w-1/2 animate-pulse" />
                  <div className="h-2.5 bg-gray-200 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
