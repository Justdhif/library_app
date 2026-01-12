<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\SocialLink;
use Illuminate\Database\Seeder;

class AuthorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $authors = [
            [
                'name' => 'Pramoedya Ananta Toer',
                'slug' => 'pramoedya-ananta-toer',
                'biography' => 'Pramoedya Ananta Toer adalah salah satu pengarang yang produktif dalam sejarah sastra Indonesia. Ia menulis novel, cerita pendek, esai, dan kronik. Karya-karyanya diterjemahkan ke dalam lebih dari 42 bahasa.',
                'birth_date' => '1925-02-06',
                'death_date' => '2006-04-30',
                'nationality' => 'Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Andrea Hirata',
                'slug' => 'andrea-hirata',
                'biography' => 'Andrea Hirata adalah novelis Indonesia yang terkenal dengan novel Laskar Pelangi. Ia adalah anak Melayu Belitong dari kampung nelayan di Pulau Belitong, Kepulauan Bangka Belitong.',
                'birth_date' => '1967-10-24',
                'nationality' => 'Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Tere Liye',
                'slug' => 'tere-liye',
                'biography' => 'Tere Liye adalah penulis novel Indonesia yang sangat produktif. Ia telah menulis lebih dari 30 novel dengan berbagai genre mulai dari romance, fantasi, hingga fiksi ilmiah.',
                'birth_date' => '1979-05-21',
                'nationality' => 'Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Dee Lestari',
                'slug' => 'dee-lestari',
                'biography' => 'Dewi Lestari Simangunsong, lebih dikenal dengan nama pena Dee Lestari atau Dee, adalah seorang penulis, penyanyi, dan pencipta lagu Indonesia. Novel pertamanya, Supernova: Ksatria, Puteri, dan Bintang Jatuh, menjadi fenomena di Indonesia.',
                'birth_date' => '1976-01-20',
                'nationality' => 'Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Eka Kurniawan',
                'slug' => 'eka-kurniawan',
                'biography' => 'Eka Kurniawan adalah penulis Indonesia yang karyanya telah diterjemahkan ke dalam lebih dari 30 bahasa. Novel Cantik Itu Luka mendapat pengakuan internasional.',
                'birth_date' => '1975-11-28',
                'nationality' => 'Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Raditya Dika',
                'slug' => 'raditya-dika',
                'biography' => 'Raditya Dika adalah penulis, sutradara, aktor, dan komedian Indonesia. Ia dikenal melalui buku-buku komedinya yang ringan dan menghibur.',
                'birth_date' => '1984-12-28',
                'nationality' => 'Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Sapardi Djoko Damono',
                'slug' => 'sapardi-djoko-damono',
                'biography' => 'Sapardi Djoko Damono adalah penyair, esais, dan kritikus sastra Indonesia. Puisi-puisinya yang sederhana namun mendalam telah menjadi bagian dari sastra Indonesia modern.',
                'birth_date' => '1940-03-20',
                'death_date' => '2020-07-19',
                'nationality' => 'Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Chairil Anwar',
                'slug' => 'chairil-anwar',
                'biography' => 'Chairil Anwar adalah penyair terkemuka Indonesia. Ia dianggap sebagai pelopor Angkatan 45 dalam sastra Indonesia. Karya-karyanya yang paling terkenal antara lain "Aku" dan "Derai-Derai Cemara".',
                'birth_date' => '1922-07-26',
                'death_date' => '1949-04-28',
                'nationality' => 'Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Sutan Takdir Alisjahbana',
                'slug' => 'sutan-takdir-alisjahbana',
                'biography' => 'Sutan Takdir Alisjahbana adalah seorang sastrawan, penyair, dan pelopor perkembangan bahasa Indonesia modern. Ia adalah salah satu pendiri Pujangga Baru.',
                'birth_date' => '1908-02-11',
                'death_date' => '1994-07-17',
                'nationality' => 'Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Ayu Utami',
                'slug' => 'ayu-utami',
                'biography' => 'Ayu Utami adalah novelis Indonesia yang terkenal dengan novel kontroversialnya, Saman, yang memenangkan penghargaan Prince Claus Award pada tahun 2000.',
                'birth_date' => '1968-11-21',
                'nationality' => 'Indonesia',
                'is_active' => true,
            ],
        ];

        foreach ($authors as $authorData) {
            $author = Author::create($authorData);

            // Create social links for each author
            $socialLinks = [
                ['platform' => 'twitter', 'url' => 'https://twitter.com/' . $author->slug],
                ['platform' => 'facebook', 'url' => 'https://facebook.com/' . $author->slug],
                ['platform' => 'instagram', 'url' => 'https://instagram.com/' . $author->slug],
            ];

            foreach ($socialLinks as $link) {
                $author->socialLinks()->create($link);
            }
        }

        $this->command->info('Authors and social links seeded successfully!');
    }
}
