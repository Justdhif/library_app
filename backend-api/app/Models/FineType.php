<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FineType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'book_condition',
        'amount',
        'description',
        'is_active',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get fine type by book condition
     */
    public static function getByCondition(string $condition)
    {
        return self::where('book_condition', $condition)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Get all active fine types
     */
    public static function getActive()
    {
        return self::where('is_active', true)->get();
    }
}
