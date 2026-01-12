<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Services\TagService;
use App\Http\Requests\Tag\StoreTagRequest;

class TagController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    protected $tagService;

    public function __construct(TagService $tagService)
    {
        $this->tagService = $tagService;
    }

    public function index(Request $request)
    {
        $tags = $this->tagService->getAllTags($request->all());
        return $this->successResponse($tags);
    }

    public function store(StoreTagRequest $request)
    {
        $this->authorize('create', Tag::class);

        try {
            $tag = $this->tagService->createTag($request->validated());
            return $this->createdResponse($tag, 'Tag created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function show(Tag $tag)
    {
        $tag = $this->tagService->getTagWithItems($tag);
        return $this->successResponse($tag);
    }

    public function update(Request $request, Tag $tag)
    {
        $this->authorize('update', $tag);

        $request->validate([
            'name' => 'sometimes|string|max:50|unique:tags,name,' . $tag->id,
            'description' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:7',
        ]);

        try {
            $tag = $this->tagService->updateTag($tag, $request->all());
            return $this->successResponse($tag, 'Tag updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function destroy(Tag $tag)
    {
        $this->authorize('delete', $tag);

        try {
            $this->tagService->deleteTag($tag);
            return $this->noContentResponse('Tag deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function attachToBook(Request $request, Tag $tag)
    {
        $this->authorize('update', $tag);

        $request->validate([
            'book_id' => 'required|exists:books,id',
        ]);

        try {
            $this->tagService->attachTagToEntity($tag, 'App\\Models\\Book', $request->book_id, auth()->id());
            return $this->successResponse(null, 'Tag attached successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function detachFromBook(Request $request, Tag $tag)
    {
        $this->authorize('update', $tag);

        $request->validate([
            'book_id' => 'required|exists:books,id',
        ]);

        try {
            $this->tagService->detachTagFromEntity($tag, 'App\\Models\\Book', $request->book_id);
            return $this->successResponse(null, 'Tag detached successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function popular(Request $request)
    {
        $tags = $this->tagService->getPopularTags($request->get('limit', 20));
        return $this->successResponse($tags);
    }
}
