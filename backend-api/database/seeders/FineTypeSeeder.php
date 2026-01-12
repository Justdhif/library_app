<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\FineType;

class FineTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fineTypes = [
            [
                'name' => 'Denda Buku Kondisi Cukup',
                'code' => 'FAIR_CONDITION',
                'book_condition' => 'fair',
                'amount' => 25000.00,
                'description' => 'Denda untuk buku yang dikembalikan dengan kondisi cukup (noticeable wear, acceptable condition)',
                'is_active' => true,
            ],
            [
                'name' => 'Denda Buku Kondisi Buruk',
                'code' => 'POOR_CONDITION',
                'book_condition' => 'poor',
                'amount' => 50000.00,
                'description' => 'Denda untuk buku yang dikembalikan dengan kondisi buruk (significant wear, damaged)',
                'is_active' => true,
            ],
            [
                'name' => 'Denda Buku Rusak Parah',
                'code' => 'DAMAGED_CONDITION',
                'book_condition' => 'damaged',
                'amount' => 100000.00,
                'description' => 'Denda untuk buku yang dikembalikan dengan kondisi rusak parah (severely damaged)',
                'is_active' => true,
            ],
        ];

        foreach ($fineTypes as $fineType) {
            FineType::updateOrCreate(
                ['code' => $fineType['code']],
                $fineType
            );
        }
    }
}
