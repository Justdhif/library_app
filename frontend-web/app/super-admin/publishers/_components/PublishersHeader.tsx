import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import Link from 'next/link';

export function PublishersHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Publisher Management</h1>
        <p className="text-muted-foreground mt-1">
          Kelola data penerbit buku perpustakaan
        </p>
      </div>
      <Link href="/publishers/add">
        <Button className="bg-emerald-600 hover:bg-emerald-700" style={{ backgroundColor: 'var(--brand-primary-dark)' }}>
          <Building2 className="mr-2 h-4 w-4" />
          Tambah Publisher
        </Button>
      </Link>
    </div>
  );
}
