<?php

namespace App\Services;

use App\Models\Publisher;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class PublisherService
{
    public function getAllPublishers()
    {
        $perPage = request()->get('per_page', 15);
        $search = request()->get('search');

        $query = Publisher::query();

        // Apply search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        return $query->withCount('books')
            ->orderBy('name', 'asc')
            ->paginate($perPage);
    }

    public function createPublisher(array $data): Publisher
    {
        return Publisher::create([
            'name' => $data['name'],
            'address' => $data['address'] ?? null,
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'website' => $data['website'] ?? null,
            'description' => $data['description'] ?? null,
        ]);
    }

    public function updatePublisher(Publisher $publisher, array $data): Publisher
    {
        $publisher->update(array_filter([
            'name' => $data['name'] ?? $publisher->name,
            'address' => $data['address'] ?? $publisher->address,
            'phone' => $data['phone'] ?? $publisher->phone,
            'email' => $data['email'] ?? $publisher->email,
            'website' => $data['website'] ?? $publisher->website,
            'description' => $data['description'] ?? $publisher->description,
        ]));

        return $publisher->fresh();
    }

    public function deletePublisher(Publisher $publisher): bool
    {
        if ($publisher->books()->exists()) {
            throw new \Exception('Cannot delete publisher with existing books');
        }

        return $publisher->delete();
    }

    public function getPublisherWithBooks(Publisher $publisher)
    {
        return $publisher->load(['books' => function ($query) {
            $query->where('is_active', true)->with(['categories', 'authors']);
        }]);
    }
}
