import { Book } from '@/lib/types/api';
import { BooksTableRow } from './BooksTableRow';

interface BooksTableProps {
  books: Book[];
  onDelete: (book: Book) => void;
}

export function BooksTable({ books, onDelete }: BooksTableProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {books.map((book) => (
        <BooksTableRow
          key={book.id}
          book={book}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
