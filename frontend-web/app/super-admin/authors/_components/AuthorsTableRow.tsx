'use client';

import { Author } from '@/lib/types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserCircle, 
  Globe, 
  Calendar, 
  Edit, 
  Trash2,
  CheckCircle2,
  XCircle,
  BookOpen
} from 'lucide-react';
import Image from 'next/image';

interface AuthorsTableRowProps {
  author: Author;
  onEdit: (author: Author) => void;
  onDelete: (author: Author) => void;
}

export function AuthorsTableRow({ author, onEdit, onDelete }: AuthorsTableRowProps) {
  return (
    <Card className="hover:shadow-lg transition-all hover:border-emerald-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shrink-0 overflow-hidden">
              {author.photo ? (
                <Image
                  src={author.photo}
                  alt={author.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <UserCircle className="h-6 w-6 text-emerald-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg line-clamp-1 mb-1">
                {author.name}
              </h3>
              {author.is_active ? (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          {author.nationality && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{author.nationality}</span>
            </div>
          )}
          {author.birth_date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">
                {new Date(author.birth_date).toLocaleDateString('id-ID', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                {author.death_date && ` - ${new Date(author.death_date).toLocaleDateString('id-ID', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}`}
              </span>
            </div>
          )}
          {author.books_count !== undefined && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{author.books_count} Buku</span>
            </div>
          )}
        </div>

        {author.biography && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-10">
            {author.biography}
          </p>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
            onClick={() => onEdit(author)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(author)}
            className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
