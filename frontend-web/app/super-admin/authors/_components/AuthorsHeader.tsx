import { Button } from '@/components/ui/button';
import { UserCircle, Plus } from 'lucide-react';

interface AuthorsHeaderProps {
  onAddAuthor: () => void;
}

export function AuthorsHeader({ onAddAuthor }: AuthorsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Authors Management</h1>
        <p className="text-muted-foreground mt-1">
          Kelola data penulis untuk katalog buku
        </p>
      </div>
      <Button 
        onClick={onAddAuthor}
        className="bg-emerald-600 hover:bg-emerald-700" 
        style={{ backgroundColor: 'var(--brand-primary-dark)' }}
      >
        <Plus className="mr-2 h-4 w-4" />
        Tambah Penulis
      </Button>
    </div>
  );
}
