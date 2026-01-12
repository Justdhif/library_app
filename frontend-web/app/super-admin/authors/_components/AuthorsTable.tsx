'use client';

import { Author } from '@/lib/types/api';
import { AuthorsTableRow } from './AuthorsTableRow';

interface AuthorsTableProps {
  authors: Author[];
  loading: boolean;
  onEdit: (author: Author) => void;
  onDelete: (author: Author) => void;
}

export function AuthorsTable({ authors, loading, onEdit, onDelete }: AuthorsTableProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 rounded-lg border bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (authors.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {authors.map((author) => (
        <AuthorsTableRow
          key={author.id}
          author={author}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
