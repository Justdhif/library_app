<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Str;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class CategoryService
{
    public function getAllCategories()
    {
        $perPage = request()->get('per_page', 15);
        $search = request()->get('search');

        $query = Category::query();

        // Apply search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply filters
        if (request()->has('parent_id')) {
            $query->where('parent_id', request()->get('parent_id'));
        }

        return $query->with(['parent', 'children'])
            ->withCount('books')
            ->orderBy('order', 'desc') // Most used categories first
            ->orderBy('name', 'asc')    // Then alphabetically
            ->paginate($perPage);
    }

    public function createCategory(array $data): Category
    {
        // Validate parent_id if provided
        if (isset($data['parent_id'])) {
            $parent = Category::find($data['parent_id']);
            if (!$parent) {
                throw new \Exception('Parent category not found');
            }
        }

        // Generate unique slug from name
        $slug = $this->generateUniqueSlug($data['name']);

        return Category::create([
            'name' => $data['name'],
            'slug' => $slug,
            'description' => $data['description'] ?? null,
            'parent_id' => $data['parent_id'] ?? null,
            'icon' => $data['icon'] ?? null,
            'order' => $data['order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function updateCategory(Category $category, array $data): Category
    {
        // Validate parent_id if provided
        if (isset($data['parent_id']) && $data['parent_id'] == $category->id) {
            throw new \Exception('Category cannot be its own parent');
        }

        // Check for circular reference
        if (isset($data['parent_id'])) {
            $this->checkCircularReference($category->id, $data['parent_id']);
        }

        // Generate new slug if name is changed
        $updateData = array_filter([
            'name' => $data['name'] ?? $category->name,
            'description' => $data['description'] ?? $category->description,
            'parent_id' => isset($data['parent_id']) ? $data['parent_id'] : $category->parent_id,
            'icon' => array_key_exists('icon', $data) ? $data['icon'] : $category->icon,
            'order' => array_key_exists('order', $data) ? $data['order'] : $category->order,
            'is_active' => isset($data['is_active']) ? $data['is_active'] : $category->is_active,
        ], function ($value) {
            return $value !== null;
        });

        // Regenerate slug if name changed
        if (isset($data['name']) && $data['name'] !== $category->name) {
            $updateData['slug'] = $this->generateUniqueSlug($data['name'], $category->id);
        }

        $category->update($updateData);

        return $category->fresh(['parent', 'children']);
    }

    public function deleteCategory(Category $category): bool
    {
        if ($category->children()->exists()) {
            throw new \Exception('Cannot delete category with subcategories');
        }

        if ($category->books()->exists()) {
            throw new \Exception('Cannot delete category with existing books');
        }

        return $category->delete();
    }

    public function getCategoryWithRelations(Category $category)
    {
        return $category->load(['parent', 'children', 'books' => function ($query) {
            $query->where('is_active', true)->with(['publisher', 'authors']);
        }]);
    }

    public function getRootCategories()
    {
        return Category::whereNull('parent_id')
            ->with('children')
            ->orderBy('order', 'desc') // Most used first
            ->orderBy('name')           // Then alphabetically
            ->get();
    }

    protected function checkCircularReference(int $categoryId, int $parentId): void
    {
        $parent = Category::find($parentId);

        while ($parent) {
            if ($parent->id == $categoryId) {
                throw new \Exception('Circular reference detected: category cannot be a descendant of itself');
            }
            $parent = $parent->parent;
        }
    }

    /**
     * Generate unique slug from category name
     */
    protected function generateUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        // Check if slug exists (excluding current category if updating)
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
        $query = Category::where('slug', $slug);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Increment category usage order (called when category is used in books)
     * Higher order = more frequently used = shown first
     */
    public function incrementCategoryUsage(int $categoryId): void
    {
        $category = Category::find($categoryId);
        if ($category) {
            $category->increment('order');
        }
    }

    /**
     * Increment usage for multiple categories at once
     */
    public function incrementMultipleCategoriesUsage(array $categoryIds): void
    {
        Category::whereIn('id', $categoryIds)->increment('order');
    }
}
