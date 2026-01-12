<?php

namespace Database\Seeders;

use App\Models\Publisher;
use App\Models\SocialLink;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PublisherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $publishers = [
            [
                'name' => 'Gramedia Pustaka Utama',
                'slug' => 'gramedia-pustaka-utama',
                'description' => 'Penerbit buku terkemuka di Indonesia yang menerbitkan berbagai jenis buku berkualitas sejak 1970.',
                'email' => 'info@gramedia.com',
                'phone' => '021-53650110',
                'address' => 'Gedung Gramedia Matraman, Jl. Matraman Raya No. 55-57',
                'city' => 'Jakarta',
                'country' => 'Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Penerbit Erlangga',
                'slug' => 'penerbit-erlangga',
                'description' => 'Penerbit buku pelajaran dan pendidikan terbesar di Indonesia dengan pengalaman lebih dari 60 tahun.',
                'email' => 'customercare@erlangga.co.id',
                'phone' => '021-4616532',
                'address' => 'Jl. H. Baping Raya No. 100',
                'city' => 'Jakarta',
                'country' => 'Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Mizan Pustaka',
                'slug' => 'mizan-pustaka',
                'description' => 'Penerbit yang fokus pada buku-buku islami, sastra, dan pengembangan diri.',
                'email' => 'info@mizan.com',
                'phone' => '022-5202288',
                'address' => 'Jl. Cinambo No. 135',
                'city' => 'Bandung',
                'country' => 'Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Bentang Pustaka',
                'slug' => 'bentang-pustaka',
                'description' => 'Penerbit indie yang menerbitkan karya-karya sastra dan novel populer Indonesia.',
                'email' => 'bentang@bentangpustaka.com',
                'phone' => '0274-561605',
                'address' => 'Jl. Cermai No. 10',
                'city' => 'Yogyakarta',
                'country' => 'Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Penerbit Andi',
                'slug' => 'penerbit-andi',
                'description' => 'Penerbit buku-buku komputer, teknologi informasi, dan teknik.',
                'email' => 'info@andipublisher.com',
                'phone' => '0274-561881',
                'address' => 'Jl. Beo No. 38-40',
                'city' => 'Yogyakarta',
                'country' => 'Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Penerbit Grasindo',
                'slug' => 'penerbit-grasindo',
                'description' => 'Penerbit yang menerbitkan buku-buku motivasi, bisnis, dan pengembangan diri.',
                'email' => 'info@grasindo.co.id',
                'phone' => '021-53650110',
                'address' => 'Gedung Kompas Gramedia Unit II Lt. 6',
                'city' => 'Jakarta',
                'country' => 'Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Elex Media Komputindo',
                'slug' => 'elex-media-komputindo',
                'description' => 'Penerbit buku-buku komputer, manga, dan komik populer.',
                'email' => 'customer@elexmedia.co.id',
                'phone' => '021-53650110',
                'address' => 'Gedung Kompas Gramedia, Jl. Palmerah Selatan',
                'city' => 'Jakarta',
                'country' => 'Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Penerbit Noura Books',
                'slug' => 'penerbit-noura-books',
                'description' => 'Penerbit novel romance dan fiksi populer untuk anak muda.',
                'email' => 'noura@nourabooks.com',
                'phone' => '021-29567888',
                'address' => 'Jl. Kemang Timur No. 1',
                'city' => 'Jakarta',
                'country' => 'Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Penerbit Republika',
                'slug' => 'penerbit-republika',
                'description' => 'Penerbit yang fokus pada buku-buku islami, biografi, dan sejarah.',
                'email' => 'info@republikapenerbit.com',
                'phone' => '021-7801818',
                'address' => 'Gedung Republika, Jl. Warung Buncit Raya',
                'city' => 'Jakarta',
                'country' => 'Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Penerbit Baca',
                'slug' => 'penerbit-baca',
                'description' => 'Penerbit buku anak-anak dan pendidikan karakter.',
                'email' => 'info@penerbitbaca.com',
                'phone' => '021-5790-5222',
                'address' => 'Jl. Kuningan Barat No. 26',
                'city' => 'Jakarta',
                'country' => 'Indonesia',
                'is_active' => true,
            ],
        ];

        foreach ($publishers as $publisherData) {
            $publisher = Publisher::create($publisherData);

            // Create social links for each publisher
            $socialLinks = [
                ['platform' => 'website', 'url' => 'https://www.' . $publisher->slug . '.com'],
                ['platform' => 'twitter', 'url' => 'https://twitter.com/' . $publisher->slug],
                ['platform' => 'facebook', 'url' => 'https://facebook.com/' . $publisher->slug],
                ['platform' => 'instagram', 'url' => 'https://instagram.com/' . $publisher->slug],
            ];

            foreach ($socialLinks as $link) {
                $publisher->socialLinks()->create($link);
            }
        }

        $this->command->info('Publishers and social links seeded successfully!');
    }
}
