import { Button } from '@/components/ui/button';
import { Folder, Plus } from 'lucide-react';

interface CategoriesHeaderProps {
  onAddCategory: () => void;
}

export function CategoriesHeader({ onAddCategory }: CategoriesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Categories Management</h1>
        <p className="text-muted-foreground mt-1">
          Kelola kategori untuk mengorganisir koleksi buku
        </p>
      </div>
      <Button 
        onClick={onAddCategory}
        className="bg-emerald-600 hover:bg-emerald-700" 
        style={{ backgroundColor: 'var(--brand-primary-dark)' }}
      >
        <Plus className="mr-2 h-4 w-4" />
        Tambah Kategori
      </Button>
    </div>
  );
}
