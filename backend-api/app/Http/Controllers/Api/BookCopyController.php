<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BookCopy;
use App\Models\Book;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Services\BookCopyService;
use App\Http\Requests\BookCopy\StoreBookCopyRequest;
use App\Http\Requests\BookCopy\UpdateBookCopyRequest;

class BookCopyController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    protected $bookCopyService;

    public function __construct(BookCopyService $bookCopyService)
    {
        $this->bookCopyService = $bookCopyService;
    }

    public function index()
    {
        $this->authorize('viewAny', BookCopy::class);

        $copies = $this->bookCopyService->getAllBookCopies();
        return $this->successResponse($copies);
    }

    public function byBook(Book $book)
    {
        $copies = $this->bookCopyService->getBookCopies($book);
        return $this->successResponse($copies);
    }

    public function store(StoreBookCopyRequest $request)
    {
        $this->authorize('create', BookCopy::class);

        try {
            $copy = $this->bookCopyService->createBookCopy($request->validated());
            return $this->createdResponse($copy, 'Book copy created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function show(BookCopy $bookCopy)
    {
        $this->authorize('view', $bookCopy);

        $bookCopy = $this->bookCopyService->getBookCopyWithDetails($bookCopy);
        return $this->successResponse($bookCopy);
    }

    public function update(UpdateBookCopyRequest $request, BookCopy $bookCopy)
    {
        $this->authorize('update', $bookCopy);

        try {
            $bookCopy = $this->bookCopyService->updateBookCopy($bookCopy, $request->validated());
            return $this->successResponse($bookCopy, 'Book copy updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function destroy(BookCopy $bookCopy)
    {
        $this->authorize('delete', $bookCopy);

        try {
            $this->bookCopyService->deleteBookCopy($bookCopy);
            return $this->noContentResponse('Book copy deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function available(Book $book)
    {
        $copies = $this->bookCopyService->getAvailableCopies($book->id);
        return $this->successResponse($copies);
    }
}
