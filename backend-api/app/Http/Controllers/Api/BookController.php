<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Services\BookService;
use App\Http\Requests\Book\StoreBookRequest;
use App\Http\Requests\Book\UpdateBookRequest;

class BookController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    protected $bookService;

    public function __construct(BookService $bookService)
    {
        $this->bookService = $bookService;
    }

    public function index()
    {
        $books = $this->bookService->getAllBooks();
        return $this->successResponse($books);
    }

    public function store(StoreBookRequest $request)
    {
        $this->authorize('create', Book::class);

        try {
            $book = $this->bookService->createBook($request->validated());
            return $this->createdResponse($book, 'Book created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function show(Book $book)
    {
        $book = $this->bookService->getBookWithDetails($book);
        return $this->successResponse($book);
    }

    public function update(UpdateBookRequest $request, Book $book)
    {
        $this->authorize('update', $book);

        try {
            $book = $this->bookService->updateBook($book, $request->validated());
            return $this->successResponse($book, 'Book updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function destroy(Book $book)
    {
        $this->authorize('delete', $book);

        try {
            $this->bookService->deleteBook($book);
            return $this->noContentResponse('Book deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function availability(Book $book)
    {
        $availability = $this->bookService->checkAvailability($book);
        return $this->successResponse($availability);
    }

    public function featured()
    {
        $books = $this->bookService->getFeaturedBooks();
        return $this->successResponse($books);
    }

    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:2',
        ]);

        $books = $this->bookService->searchBooks($request->q);
        return $this->successResponse($books);
    }
}
