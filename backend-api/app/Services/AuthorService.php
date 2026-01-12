<?php

namespace App\Services;

use App\Models\Author;
use Illuminate\Support\Str;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class AuthorService
{
    public function getAllAuthors()
    {
        $perPage = request()->get('per_page', 15);
        $search = request()->get('search');

        $query = Author::query();

        // Apply search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('biography', 'like', "%{$search}%")
                  ->orWhere('nationality', 'like', "%{$search}%");
            });
        }

        // Apply filters
        if (request()->has('nationality')) {
            $query->where('nationality', request()->get('nationality'));
        }

        return $query->with('socialLinks')
            ->withCount('books')
            ->orderBy('name', 'asc')
            ->paginate($perPage);
    }

    public function createAuthor(array $data): Author
    {
        // Generate unique slug from name
        $slug = $this->generateUniqueSlug($data['name']);

        // Handle photo upload
        $photoPath = null;
        if (isset($data['photo']) && $data['photo'] instanceof \Illuminate\Http\UploadedFile) {
            $photoPath = $data['photo']->store('authors', 'public');
        }

        $author = Author::create([
            'name' => $data['name'],
            'slug' => $slug,
            'biography' => $data['biography'] ?? null,
            'birth_date' => $data['birth_date'] ?? null,
            'death_date' => $data['death_date'] ?? null,
            'nationality' => $data['nationality'] ?? null,
            'photo' => $photoPath,
            'is_active' => $data['is_active'] ?? true,
        ]);

        // Handle social links
        if (isset($data['social_links']) && is_array($data['social_links'])) {
            $this->syncSocialLinks($author, $data['social_links']);
        }

        return $author->fresh(['socialLinks']);
    }

    public function updateAuthor(Author $author, array $data): Author
    {
        $updateData = array_filter([
            'biography' => $data['biography'] ?? $author->biography,
            'birth_date' => $data['birth_date'] ?? $author->birth_date,
            'death_date' => $data['death_date'] ?? $author->death_date,
            'nationality' => $data['nationality'] ?? $author->nationality,
        ], function ($value) {
            return $value !== null;
        });

        // Handle photo upload
        if (isset($data['photo']) && $data['photo'] instanceof \Illuminate\Http\UploadedFile) {
            // Delete old photo if exists
            if ($author->photo) {
                \Storage::disk('public')->delete($author->photo);
            }
            $updateData['photo'] = $data['photo']->store('authors', 'public');
        }

        // Update is_active if provided
        if (isset($data['is_active'])) {
            $updateData['is_active'] = $data['is_active'];
        }

        // Update name and regenerate slug if name changed
        if (isset($data['name']) && $data['name'] !== $author->name) {
            $updateData['name'] = $data['name'];
            $updateData['slug'] = $this->generateUniqueSlug($data['name'], $author->id);
        }

        $author->update($updateData);

        // Handle social links
        if (isset($data['social_links']) && is_array($data['social_links'])) {
            $this->syncSocialLinks($author, $data['social_links']);
        }

        return $author->fresh(['socialLinks']);
    }

    public function deleteAuthor(Author $author): bool
    {
        if ($author->books()->exists()) {
            throw new \Exception('Cannot delete author with existing books');
        }

        return $author->delete();
    }

    public function getAuthorWithBooks(Author $author)
    {
        return $author->load(['books' => function ($query) {
            $query->where('is_active', true)->with(['publisher', 'categories']);
        }]);
    }

    /**
     * Sync social links for author
     */
    protected function syncSocialLinks(Author $author, array $socialLinks): void
    {
        // Delete existing social links
        $author->socialLinks()->delete();

        // Create new social links
        foreach ($socialLinks as $link) {
            if (!empty($link['platform']) && !empty($link['url'])) {
                $author->socialLinks()->create([
                    'platform' => $link['platform'],
                    'url' => $link['url'],
                ]);
            }
        }
    }

    /**
     * Generate unique slug from author name
     */
    protected function generateUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        // Check if slug exists (excluding current author if updating)
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
        $query = Author::where('slug', $slug);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}
