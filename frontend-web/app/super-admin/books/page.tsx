import { BooksHeader } from '@/components/custom-ui/books/BooksHeader';
import { BooksClient } from '@/components/custom-ui/books/BooksClient';

export default function BooksPage() {
  return (
    <div className="p-6 space-y-6">
      <BooksHeader />
      <BooksClient />
    </div>
  );
}
