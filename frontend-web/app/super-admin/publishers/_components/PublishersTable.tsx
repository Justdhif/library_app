'use client';

import { Publisher } from '@/lib/types/api';
import { PublishersTableRow } from './PublishersTableRow';

interface PublishersTableProps {
  publishers: Publisher[];
  loading: boolean;
  onDelete: (publisher: Publisher) => void;
}

export function PublishersTable({ publishers, loading, onDelete }: PublishersTableProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 rounded-lg border bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (publishers.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {publishers.map((publisher) => (
        <PublishersTableRow
          key={publisher.id}
          publisher={publisher}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
