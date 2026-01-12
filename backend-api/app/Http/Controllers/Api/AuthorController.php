<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Services\AuthorService;
use App\Http\Requests\Author\StoreAuthorRequest;
use App\Http\Requests\Author\UpdateAuthorRequest;

class AuthorController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    protected $authorService;

    public function __construct(AuthorService $authorService)
    {
        $this->authorService = $authorService;
    }

    public function index()
    {
        $authors = $this->authorService->getAllAuthors();
        return $this->successResponse($authors);
    }

    public function store(StoreAuthorRequest $request)
    {
        $this->authorize('create', Author::class);

        try {
            $author = $this->authorService->createAuthor($request->validated());
            return $this->createdResponse($author, 'Author created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function show(Author $author)
    {
        $author = $this->authorService->getAuthorWithBooks($author);
        return $this->successResponse($author);
    }

    public function update(UpdateAuthorRequest $request, Author $author)
    {
        $this->authorize('update', $author);

        try {
            $author = $this->authorService->updateAuthor($author, $request->validated());
            return $this->successResponse($author, 'Author updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function destroy(Author $author)
    {
        $this->authorize('delete', $author);

        try {
            $this->authorService->deleteAuthor($author);
            return $this->noContentResponse('Author deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}
