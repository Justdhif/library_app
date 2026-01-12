<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Services\CategoryService;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;

class CategoryController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    protected $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    public function index()
    {
        $categories = $this->categoryService->getAllCategories();
        return $this->successResponse($categories);
    }

    public function store(StoreCategoryRequest $request)
    {
        $this->authorize('create', Category::class);

        try {
            $category = $this->categoryService->createCategory($request->validated());
            return $this->createdResponse($category, 'Category created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function show(Category $category)
    {
        $category = $this->categoryService->getCategoryWithRelations($category);
        return $this->successResponse($category);
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $this->authorize('update', $category);

        try {
            $category = $this->categoryService->updateCategory($category, $request->validated());
            return $this->successResponse($category, 'Category updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function destroy(Category $category)
    {
        $this->authorize('delete', $category);

        try {
            $this->categoryService->deleteCategory($category);
            return $this->noContentResponse('Category deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function tree()
    {
        $categories = $this->categoryService->getRootCategories();
        return $this->successResponse($categories);
    }
}
