<?php

namespace App\Services;

use App\Models\BookCopy;
use App\Models\Book;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class BookCopyService
{
    public function getAllBookCopies()
    {
        $perPage = request()->get('per_page', 15);
        $search = request()->get('search');

        $query = BookCopy::query();

        // Apply search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('barcode', 'like', "%{$search}%")
                  ->orWhereHas('book', function ($bookQuery) use ($search) {
                      $bookQuery->where('title', 'like', "%{$search}%");
                  });
            });
        }

        // Apply filters
        if (request()->has('book_id')) {
            $query->where('book_id', request()->get('book_id'));
        }
        if (request()->has('status')) {
            $query->where('status', request()->get('status'));
        }
        if (request()->has('condition')) {
            $query->where('condition', request()->get('condition'));
        }

        return $query->with(['book.authors', 'book.publisher'])
            ->orderBy('barcode', 'asc')
            ->paginate($perPage);
    }

    public function getBookCopies(Book $book)
    {
        return BookCopy::where('book_id', $book->id)
            ->with(['book.authors', 'book.publisher'])
            ->orderBy('barcode', 'asc')
            ->get();
    }

    public function createBookCopy(array $data): BookCopy
    {
        $copy = BookCopy::create([
            'book_id' => $data['book_id'],
            'barcode' => $data['barcode'],
            'call_number' => $data['call_number'],
            'condition' => $data['condition'],
            'status' => $data['status'] ?? 'available',
            'location' => $data['location'] ?? null,
            'shelf_number' => $data['shelf_number'] ?? null,
            'acquisition_date' => $data['acquisition_date'] ?? null,
            'acquisition_price' => $data['acquisition_price'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        // Update book availability
        $copy->book->updateAvailability();

        return $copy->load('book.authors', 'book.publisher');
    }

    public function updateBookCopy(BookCopy $bookCopy, array $data): BookCopy
    {
        $bookCopy->update(array_filter([
            'barcode' => $data['barcode'] ?? $bookCopy->barcode,
            'call_number' => $data['call_number'] ?? $bookCopy->call_number,
            'condition' => $data['condition'] ?? $bookCopy->condition,
            'status' => $data['status'] ?? $bookCopy->status,
            'location' => $data['location'] ?? $bookCopy->location,
            'shelf_number' => $data['shelf_number'] ?? $bookCopy->shelf_number,
            'acquisition_date' => $data['acquisition_date'] ?? $bookCopy->acquisition_date,
            'acquisition_price' => $data['acquisition_price'] ?? $bookCopy->acquisition_price,
            'notes' => $data['notes'] ?? $bookCopy->notes,
        ], function ($value) {
            return !is_null($value);
        }));

        return $bookCopy->fresh();
    }

    public function deleteBookCopy(BookCopy $bookCopy): bool
    {
        if ($bookCopy->borrowings()->whereIn('status', ['pending', 'approved', 'borrowed'])->exists()) {
            throw new \Exception('Cannot delete book copy with active borrowings');
        }

        $book = $bookCopy->book;
        $result = $bookCopy->delete();

        // Update book availability
        if ($result && $book) {
            $book->updateAvailability();
        }

        return $result;
    }

    public function getBookCopyWithDetails(BookCopy $bookCopy)
    {
        return $bookCopy->load(['book.authors', 'book.publisher', 'borrowings' => function ($query) {
            $query->latest()->limit(10);
        }]);
    }

    public function getAvailableCopies(int $bookId)
    {
        return BookCopy::where('book_id', $bookId)
            ->where('status', 'available')
            ->where('condition', '!=', 'poor')
            ->with(['book.authors', 'book.publisher'])
            ->get();
    }
}
