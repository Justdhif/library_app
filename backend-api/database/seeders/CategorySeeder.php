<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Main Categories
            [
                'name' => 'Fiksi',
                'slug' => 'fiksi',
                'description' => 'Buku-buku cerita fiksi, novel, dan karya sastra',
                'icon' => '📚',
                'order' => 10,
                'is_active' => true,
                'parent_id' => null,
            ],
            [
                'name' => 'Non-Fiksi',
                'slug' => 'non-fiksi',
                'description' => 'Buku-buku faktual, informasi, dan pengetahuan',
                'icon' => '📖',
                'order' => 9,
                'is_active' => true,
                'parent_id' => null,
            ],
            [
                'name' => 'Pendidikan',
                'slug' => 'pendidikan',
                'description' => 'Buku pelajaran dan buku pendidikan',
                'icon' => '🎓',
                'order' => 8,
                'is_active' => true,
                'parent_id' => null,
            ],
            [
                'name' => 'Teknologi',
                'slug' => 'teknologi',
                'description' => 'Buku tentang teknologi, komputer, dan pemrograman',
                'icon' => '💻',
                'order' => 7,
                'is_active' => true,
                'parent_id' => null,
            ],
            [
                'name' => 'Bisnis & Ekonomi',
                'slug' => 'bisnis-ekonomi',
                'description' => 'Buku tentang bisnis, ekonomi, dan keuangan',
                'icon' => '💼',
                'order' => 6,
                'is_active' => true,
                'parent_id' => null,
            ],
            [
                'name' => 'Agama',
                'slug' => 'agama',
                'description' => 'Buku-buku keagamaan dan spiritual',
                'icon' => '🕌',
                'order' => 5,
                'is_active' => true,
                'parent_id' => null,
            ],
            [
                'name' => 'Anak-anak',
                'slug' => 'anak-anak',
                'description' => 'Buku untuk anak-anak dan remaja',
                'icon' => '👶',
                'order' => 4,
                'is_active' => true,
                'parent_id' => null,
            ],
            [
                'name' => 'Sejarah',
                'slug' => 'sejarah',
                'description' => 'Buku tentang sejarah dan biografi',
                'icon' => '📜',
                'order' => 3,
                'is_active' => true,
                'parent_id' => null,
            ],
            [
                'name' => 'Seni & Budaya',
                'slug' => 'seni-budaya',
                'description' => 'Buku tentang seni, budaya, dan musik',
                'icon' => '🎨',
                'order' => 2,
                'is_active' => true,
                'parent_id' => null,
            ],
            [
                'name' => 'Kesehatan',
                'slug' => 'kesehatan',
                'description' => 'Buku tentang kesehatan dan kedokteran',
                'icon' => '⚕️',
                'order' => 1,
                'is_active' => true,
                'parent_id' => null,
            ],
        ];

        // Create main categories first
        $createdCategories = [];
        foreach ($categories as $category) {
            $createdCategories[$category['slug']] = Category::create($category);
        }

        // Create subcategories
        $subcategories = [
            // Fiksi subcategories
            [
                'name' => 'Novel',
                'slug' => 'novel',
                'description' => 'Novel dan karya sastra panjang',
                'parent_id' => $createdCategories['fiksi']->id,
                'order' => 0,
                'is_active' => true,
            ],
            [
                'name' => 'Cerpen',
                'slug' => 'cerpen',
                'description' => 'Cerita pendek dan kumpulan cerpen',
                'parent_id' => $createdCategories['fiksi']->id,
                'order' => 0,
                'is_active' => true,
            ],
            [
                'name' => 'Fantasi',
                'slug' => 'fantasi',
                'description' => 'Novel dan cerita fantasi',
                'parent_id' => $createdCategories['fiksi']->id,
                'order' => 0,
                'is_active' => true,
            ],
            [
                'name' => 'Romance',
                'slug' => 'romance',
                'description' => 'Novel roman dan percintaan',
                'parent_id' => $createdCategories['fiksi']->id,
                'order' => 0,
                'is_active' => true,
            ],
            [
                'name' => 'Misteri & Thriller',
                'slug' => 'misteri-thriller',
                'description' => 'Novel misteri dan thriller',
                'parent_id' => $createdCategories['fiksi']->id,
                'order' => 0,
                'is_active' => true,
            ],
            // Teknologi subcategories
            [
                'name' => 'Pemrograman',
                'slug' => 'pemrograman',
                'description' => 'Buku tentang bahasa pemrograman',
                'parent_id' => $createdCategories['teknologi']->id,
                'order' => 0,
                'is_active' => true,
            ],
            [
                'name' => 'Web Development',
                'slug' => 'web-development',
                'description' => 'Buku tentang pengembangan web',
                'parent_id' => $createdCategories['teknologi']->id,
                'order' => 0,
                'is_active' => true,
            ],
            [
                'name' => 'Data Science',
                'slug' => 'data-science',
                'description' => 'Buku tentang data science dan machine learning',
                'parent_id' => $createdCategories['teknologi']->id,
                'order' => 0,
                'is_active' => true,
            ],
            // Pendidikan subcategories
            [
                'name' => 'SD',
                'slug' => 'sd',
                'description' => 'Buku pelajaran SD',
                'parent_id' => $createdCategories['pendidikan']->id,
                'order' => 0,
                'is_active' => true,
            ],
            [
                'name' => 'SMP',
                'slug' => 'smp',
                'description' => 'Buku pelajaran SMP',
                'parent_id' => $createdCategories['pendidikan']->id,
                'order' => 0,
                'is_active' => true,
            ],
            [
                'name' => 'SMA',
                'slug' => 'sma',
                'description' => 'Buku pelajaran SMA',
                'parent_id' => $createdCategories['pendidikan']->id,
                'order' => 0,
                'is_active' => true,
            ],
            [
                'name' => 'Perguruan Tinggi',
                'slug' => 'perguruan-tinggi',
                'description' => 'Buku untuk perguruan tinggi',
                'parent_id' => $createdCategories['pendidikan']->id,
                'order' => 0,
                'is_active' => true,
            ],
        ];

        foreach ($subcategories as $subcategory) {
            Category::create($subcategory);
        }

        $this->command->info('Categories seeded successfully!');
    }
}
