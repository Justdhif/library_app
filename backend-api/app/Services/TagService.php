<?php

namespace App\Services;

use App\Models\Tag;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class TagService
{
    public function getAllTags(array $filters = [])
    {
        $query = Tag::query();

        if (isset($filters['popular'])) {
            $query->popular($filters['popular'] ?? 20);
        }

        return $query->paginate(request()->get('per_page', 50));
    }

    public function createTag(array $data): Tag
    {
        return Tag::create([
            'name' => $data['name'],
            'slug' => \Illuminate\Support\Str::slug($data['name']),
            'description' => $data['description'] ?? null,
            'color' => $data['color'] ?? '#3490dc',
        ]);
    }

    public function updateTag(Tag $tag, array $data): Tag
    {
        if (isset($data['name']) && $data['name'] !== $tag->name) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }

        $tag->update($data);
        return $tag->fresh();
    }

    public function deleteTag(Tag $tag): bool
    {
        return $tag->delete();
    }

    public function getTagWithItems(Tag $tag)
    {
        return $tag->load(['books' => fn($q) => $q->active()->with('authors')->limit(20)]);
    }

    public function attachTagToEntity(Tag $tag, string $type, int $id, int $userId): void
    {
        $book = \App\Models\Book::find($id);

        if ($book->tags()->where('tag_id', $tag->id)->exists()) {
            throw new \Exception('Tag already attached to this book');
        }

        $book->tags()->attach($tag->id, ['tagged_by' => $userId]);
        $tag->incrementUsage();
    }

    public function detachTagFromEntity(Tag $tag, string $type, int $id): void
    {
        $book = \App\Models\Book::find($id);
        $book->tags()->detach($tag->id);
        $tag->decrementUsage();
    }

    public function getPopularTags(int $limit = 20)
    {
        return Tag::popular($limit)->get();
    }
}
