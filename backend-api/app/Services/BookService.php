<?php

namespace App\Services;

use App\Models\Book;
use Illuminate\Database\Eloquent\Collection;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class BookService
{
    protected CategoryService $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    public function getAllBooks()
    {
        $perPage = request()->get('per_page', 15);
        $search = request()->get('search');

        $query = Book::query();

        // Apply search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply filters
        if (request()->has('publisher_id')) {
            $query->where('publisher_id', request()->get('publisher_id'));
        }
        if (request()->has('category_id')) {
            $query->whereHas('categories', function($q) {
                $q->where('categories.id', request()->get('category_id'));
            });
        }
        if (request()->has('language')) {
            $query->where('language', request()->get('language'));
        }
        if (request()->has('is_featured')) {
            $query->where('is_featured', request()->get('is_featured'));
        }
        if (request()->has('is_active')) {
            $query->where('is_active', request()->get('is_active'));
        }

        return $query->with(['publisher', 'authors', 'categories', 'copies'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function createBook(array $data): Book
    {
        // Generate unique slug from title
        $slug = $this->generateUniqueSlug($data['title']);

        // Handle cover image upload
        $coverImagePath = null;
        if (isset($data['cover_image']) && $data['cover_image'] instanceof \Illuminate\Http\UploadedFile) {
            $coverImagePath = $data['cover_image']->store('books/covers', 'public');
        }

        $book = Book::create([
            'title' => $data['title'],
            'slug' => $slug,
            'isbn' => $data['isbn'] ?? null,
            'isbn13' => $data['isbn13'] ?? null,
            'description' => $data['description'] ?? null,
            'publisher_id' => $data['publisher_id'],
            'publication_year' => $data['publication_year'] ?? null,
            'edition' => $data['edition'] ?? null,
            'pages' => $data['pages'] ?? null,
            'language' => $data['language'],
            'price' => $data['price'] ?? null,
            'format' => $data['format'],
            'cover_image' => $coverImagePath,
            'total_copies' => isset($data['total_copies']) ? (int) $data['total_copies'] : 0,
            'available_copies' => isset($data['total_copies']) ? (int) $data['total_copies'] : 0,
        ]);

        // Attach authors
        if (isset($data['authors'])) {
            $book->authors()->sync($data['authors']);
        }

        // Attach categories
        if (isset($data['categories'])) {
            $book->categories()->sync($data['categories']);
            // Increment usage for categories
            $this->categoryService->incrementMultipleCategoriesUsage($data['categories']);
        } elseif (isset($data['category_id'])) {
            // For backward compatibility, if only category_id provided
            $book->categories()->sync([$data['category_id']]);
            $this->categoryService->incrementCategoryUsage($data['category_id']);
        }

        // Automatically create book copies based on total_copies
        if (isset($data['total_copies']) && $data['total_copies'] > 0) {
            $totalCopies = (int) $data['total_copies'];
            $condition = $data['condition'] ?? 'new';
            $location = $data['location'] ?? null;
            $shelfNumber = $data['shelf_number'] ?? null;

            for ($i = 1; $i <= $totalCopies; $i++) {
                // Generate barcode: BOOK{book_id}-{copy_number}
                $barcode = 'BOOK' . str_pad($book->id, 6, '0', STR_PAD_LEFT) . '-' . str_pad($i, 3, '0', STR_PAD_LEFT);

                // Generate call_number: {category_code}/{book_id}/{copy_number}
                // Use first category from pivot table if available
                $firstCategory = $book->categories()->first();
                $categoryId = $firstCategory ? $firstCategory->id : 0;
                $callNumber = 'CAT' . str_pad($categoryId, 3, '0', STR_PAD_LEFT) . '/B' . str_pad($book->id, 6, '0', STR_PAD_LEFT) . '/' . str_pad($i, 3, '0', STR_PAD_LEFT);

                $book->copies()->create([
                    'barcode' => $barcode,
                    'call_number' => $callNumber,
                    'condition' => $condition,
                    'status' => 'available',
                    'location' => $location,
                    'shelf_number' => $shelfNumber,
                    'acquisition_date' => now(),
                ]);
            }
        }

        return $book->load(['publisher', 'authors', 'categories', 'copies']);
    }

    public function updateBook(Book $book, array $data): Book
    {
        $book->update(array_filter([
            'title' => $data['title'] ?? $book->title,
            'isbn' => $data['isbn'] ?? $book->isbn,
            'isbn13' => $data['isbn13'] ?? $book->isbn13,
            'description' => $data['description'] ?? $book->description,
            'publisher_id' => $data['publisher_id'] ?? $book->publisher_id,
            'category_id' => $data['category_id'] ?? $book->category_id,
            'publication_year' => $data['publication_year'] ?? $book->publication_year,
            'edition' => $data['edition'] ?? $book->edition,
            'pages' => $data['pages'] ?? $book->pages,
            'language' => $data['language'] ?? $book->language,
            'price' => $data['price'] ?? $book->price,
            'format' => $data['format'] ?? $book->format,
            'is_featured' => $data['is_featured'] ?? $book->is_featured,
            'is_active' => $data['is_active'] ?? $book->is_active,
        ]));

        // Update authors if provided
        if (isset($data['authors'])) {
            $book->authors()->sync($data['authors']);
        }

        // Update categories if provided
        if (isset($data['categories'])) {
            $book->categories()->sync($data['categories']);
            // Increment usage for categories
            $this->categoryService->incrementMultipleCategoriesUsage($data['categories']);
        }

        return $book->fresh(['publisher', 'authors', 'categories']);
    }

    public function deleteBook(Book $book): bool
    {
        return $book->delete();
    }

    public function getBookWithDetails(Book $book)
    {
        return $book->load([
            'publisher',
            'authors',
            'categories',
            'copies.borrowings',
            'comments' => function ($query) {
                $query->whereNull('parent_id')->with('user', 'replies.user');
            },
            'ratings'
        ]);
    }

    public function checkAvailability(Book $book): array
    {
        $totalCopies = $book->copies()->count();
        $availableCopies = $book->copies()
            ->where('status', 'available')
            ->count();
        $borrowedCopies = $book->copies()
            ->where('status', 'borrowed')
            ->count();

        return [
            'book_id' => $book->id,
            'title' => $book->title,
            'total_copies' => $totalCopies,
            'available_copies' => $availableCopies,
            'borrowed_copies' => $borrowedCopies,
            'is_available' => $availableCopies > 0,
        ];
    }

    public function getFeaturedBooks()
    {
        return Book::with(['publisher', 'authors', 'categories'])
            ->where('is_featured', true)
            ->where('is_active', true)
            ->paginate(request()->get('per_page', 15));
    }

    public function searchBooks(string $keyword)
    {
        return Book::with(['publisher', 'authors', 'categories'])
            ->where(function ($query) use ($keyword) {
                $query->where('title', 'like', "%{$keyword}%")
                    ->orWhere('isbn', 'like', "%{$keyword}%")
                    ->orWhere('isbn13', 'like', "%{$keyword}%")
                    ->orWhere('description', 'like', "%{$keyword}%")
                    ->orWhereHas('authors', function ($q) use ($keyword) {
                        $q->where('name', 'like', "%{$keyword}%");
                    });
            })
            ->where('is_active', true)
            ->paginate(request()->get('per_page', 15));
    }

    /**
     * Generate unique slug from book title
     */
    protected function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $slug = \Illuminate\Support\Str::slug($title);
        $originalSlug = $slug;
        $counter = 1;

        // Check if slug exists (excluding current book if updating)
        while ($this->slugExists($slug, $excludeId)) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Check if slug already exists
     */
    protected function slugExists(string $slug, ?int $excludeId = null): bool
    {
        $query = Book::where('slug', $slug);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}
