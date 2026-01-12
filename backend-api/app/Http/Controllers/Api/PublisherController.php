<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publisher;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Services\PublisherService;
use App\Http\Requests\Publisher\StorePublisherRequest;
use App\Http\Requests\Publisher\UpdatePublisherRequest;

class PublisherController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    protected $publisherService;

    public function __construct(PublisherService $publisherService)
    {
        $this->publisherService = $publisherService;
    }

    public function index()
    {
        $publishers = $this->publisherService->getAllPublishers();
        return $this->successResponse($publishers);
    }

    public function store(StorePublisherRequest $request)
    {
        $this->authorize('create', Publisher::class);

        try {
            $publisher = $this->publisherService->createPublisher($request->validated());
            return $this->createdResponse($publisher, 'Publisher created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function show(Publisher $publisher)
    {
        $publisher = $this->publisherService->getPublisherWithBooks($publisher);
        return $this->successResponse($publisher);
    }

    public function update(UpdatePublisherRequest $request, Publisher $publisher)
    {
        $this->authorize('update', $publisher);

        try {
            $publisher = $this->publisherService->updatePublisher($publisher, $request->validated());
            return $this->successResponse($publisher, 'Publisher updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function destroy(Publisher $publisher)
    {
        $this->authorize('delete', $publisher);

        try {
            $this->publisherService->deletePublisher($publisher);
            return $this->noContentResponse('Publisher deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}
