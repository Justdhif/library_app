"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { booksApi } from "@/lib/api/books";
import { publishersApi } from "@/lib/api/publishers";
import { categoriesApi } from "@/lib/api/categories";
import { authorsApi } from "@/lib/api/authors";
import type { Publisher, Category, Author } from "@/lib/types/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileInput } from "@/components/custom-ui/file-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, BookOpen, Upload, FileText, Calendar, Globe, Hash, Building2, Folder, MapPin, Package2 } from "lucide-react";
import Link from "next/link";
import { getIconByName } from "@/lib/utils/iconMapping";
import apiClient from "@/lib/api/client";
import Image from "next/image";

export default function CreateBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loadingPublishers, setLoadingPublishers] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [publisherType, setPublisherType] = useState<'existing' | 'new'>('existing');
  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    publisher_id: "",
    publication_year: new Date().getFullYear().toString(),
    pages: "",
    language: "Indonesian",
    condition: "new" as "new" | "good" | "fair" | "poor" | "damaged",
    location: "",
    shelf_number: "",
    description: "",
    total_copies: "1",
  });
  const [publisherData, setPublisherData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    website: "",
    description: "",
  });
  
  const [coverImage, setCoverImage] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        const data = await publishersApi.getAll({ is_active: true, per_page: 100 });
        setPublishers(data.data);
      } catch (error) {
        console.error('Error fetching publishers:', error);
        toast.error('Gagal memuat daftar publisher');
      } finally {
        setLoadingPublishers(false);
      }
    };
    
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getAll({ is_active: true, per_page: 100 });
        setCategories(data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Gagal memuat daftar kategori');
      } finally {
        setLoadingCategories(false);
      }
    };
    
    const fetchAuthors = async () => {
      try {
        const response = await authorsApi.getAll({ is_active: true, per_page: 100 });
        // Backend returns paginated response: { data: [...], current_page, last_page, etc }
        const authorsData = response.data || [];
        if (Array.isArray(authorsData)) {
          setAuthors(authorsData);
        } else {
          console.warn('Authors response has no data array, setting empty array');
          setAuthors([]);
        }
      } catch (error) {
        console.error('Error fetching authors:', error);
        toast.error('Gagal memuat daftar penulis');
        setAuthors([]);
      } finally {
        setLoadingAuthors(false);
      }
    };
    
    fetchPublishers();
    fetchCategories();
    fetchAuthors();
  }, []);

  // Cleanup preview URL on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Judul wajib diisi';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Judul terlalu panjang';
    }

    if (!formData.isbn.trim()) {
      newErrors.isbn = 'ISBN wajib diisi';
    } else if (formData.isbn.length < 10 || formData.isbn.length > 20) {
      newErrors.isbn = 'ISBN harus 10-20 karakter';
    }

    if (publisherType === 'existing' && !formData.publisher_id) {
      newErrors.publisher_id = 'Publisher ID wajib diisi';
    }
    
    if (publisherType === 'new' && !publisherData.name.trim()) {
      newErrors.publisher_name = 'Nama publisher wajib diisi';
    }

    if (selectedCategories.length === 0) {
      newErrors.categories = 'Minimal pilih satu kategori';
    }
    
    if (selectedAuthors.length === 0) {
      newErrors.authors = 'Minimal pilih satu penulis';
    }

    if (!formData.publication_year) {
      newErrors.publication_year = 'Tahun publikasi wajib diisi';
    } else {
      const year = parseInt(formData.publication_year);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear + 1) {
        newErrors.publication_year = 'Tahun publikasi tidak valid';
      }
    }

    if (!formData.pages) {
      newErrors.pages = 'Jumlah halaman wajib diisi';
    } else if (parseInt(formData.pages) <= 0) {
      newErrors.pages = 'Jumlah halaman harus lebih dari 0';
    }

    if (!formData.language.trim()) {
      newErrors.language = 'Bahasa wajib diisi';
    }

    if (!formData.total_copies) {
      newErrors.total_copies = 'Jumlah eksemplar wajib diisi';
    } else if (parseInt(formData.total_copies) <= 0) {
      newErrors.total_copies = 'Jumlah eksemplar harus lebih dari 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Mohon perbaiki kesalahan pada form');
      return;
    }

    try {
      setLoading(true);

      let finalPublisherId = formData.publisher_id;
      
      // Create publisher first if new publisher is selected
      if (publisherType === 'new') {
        try {
          const response = await apiClient.post('/publishers', publisherData);
          const newPublisher = response.data.data;
          
          finalPublisherId = newPublisher.id.toString();
          
          // Add new publisher to the list
          setPublishers(prev => [...prev, newPublisher]);
          
          // Update form data with new publisher ID
          setFormData(prev => ({ ...prev, publisher_id: finalPublisherId }));
          
          toast.success(`Publisher "${newPublisher.name}" berhasil dibuat`);
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Gagal membuat publisher');
          throw error;
        }
      }

      const submitData = new FormData();
      
      // Add all form fields
      submitData.append('title', formData.title);
      submitData.append('isbn', formData.isbn);
      submitData.append('publisher_id', finalPublisherId);
      submitData.append('publication_year', formData.publication_year);
      submitData.append('pages', formData.pages);
      submitData.append('language', formData.language);
      submitData.append('condition', formData.condition);
      submitData.append('total_copies', formData.total_copies);
      
      // Required fields with defaults (for backend compatibility)
      submitData.append('format', 'paperback'); // Default format
      
      // Add selected categories
      selectedCategories.forEach((categoryId) => {
        submitData.append('categories[]', categoryId);
      });
      
      // Add selected authors
      selectedAuthors.forEach((authorId) => {
        submitData.append('authors[]', authorId);
      });
      
      if (formData.description) {
        submitData.append('description', formData.description);
      }
      
      if (formData.location) {
        submitData.append('location', formData.location);
      }
      
      if (formData.shelf_number) {
        submitData.append('shelf_number', formData.shelf_number);
      }
      
      // Add cover image file if selected
      if (coverImage) {
        submitData.append('cover_image', coverImage);
      }

      await booksApi.create(submitData);
      toast.success("Buku berhasil ditambahkan");
      
      // Cleanup preview URL before navigation
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      
      router.push("/books");
    } catch (error: any) {
      console.error("Error creating book:", error);
      const errorMessage = error.response?.data?.message || "Gagal menambahkan buku";
      toast.error(errorMessage);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white shadow-lg" style={{ background: 'linear-gradient(to right, var(--brand-primary-dark), var(--brand-primary))' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-32 -translate-x-32" />
        </div>
        <div className="relative flex items-center gap-4">
          <Link href="/books">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Tambah Buku Baru</h1>
              <p className="text-white/90 mt-1">
                Lengkapi form untuk menambahkan buku ke perpustakaan
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Main Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Informasi Buku
            </CardTitle>
            <CardDescription>
              Data dasar dan detail buku
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
              {/* Left Column - Cover Image Upload */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Cover Buku</Label>
                <FileInput
                  variant="square"
                  id="cover_image"
                  value={coverImage}
                  onChange={(file) => {
                    setCoverImage(file);
                    if (file) {
                      setPreviewUrl(URL.createObjectURL(file));
                    } else {
                      setPreviewUrl("");
                    }
                  }}
                  onRemove={() => {
                    setCoverImage(undefined);
                    setPreviewUrl("");
                  }}
                  previewUrl={previewUrl}
                  label={coverImage ? 'Ganti Cover' : 'Upload Cover'}
                  description="Format: JPG, PNG, GIF (Max 2MB)"
                  maxSize={2}
                  disabled={loading}
                  fallbackIcon={<BookOpen className="h-16 w-16 text-emerald-300" />}
                  onError={(message) => toast.error(message)}
                />
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Judul Buku <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Contoh: Harry Potter and the Philosopher's Stone"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    disabled={loading}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                {/* ISBN */}
                <div className="space-y-2">
                  <Label htmlFor="isbn" className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    ISBN <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="isbn"
                    placeholder="Contoh: 978-0-7475-3269-9"
                    value={formData.isbn}
                    onChange={(e) => handleChange('isbn', e.target.value)}
                    disabled={loading}
                  />
                  {errors.isbn && (
                    <p className="text-sm text-destructive">{errors.isbn}</p>
                  )}
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <Label htmlFor="condition" className="flex items-center gap-2">
                    <Package2 className="h-4 w-4" />
                    Kondisi <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => handleChange('condition', value)}
                    disabled={loading}
                  >
                    <SelectTrigger id="condition">
                      <SelectValue placeholder="Pilih kondisi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          Baru
                        </div>
                      </SelectItem>
                      <SelectItem value="good">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          Baik
                        </div>
                      </SelectItem>
                      <SelectItem value="fair">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-500" />
                          Cukup
                        </div>
                      </SelectItem>
                      <SelectItem value="poor">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-orange-500" />
                          Kurang
                        </div>
                      </SelectItem>
                      <SelectItem value="damaged">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          Rusak
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.condition && (
                    <p className="text-sm text-destructive">{errors.condition}</p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Lokasi
                  </Label>
                  <Input
                    id="location"
                    placeholder="Contoh: Lantai 2, Rak A"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    disabled={loading}
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location}</p>
                  )}
                </div>

                {/* Shelf Number */}
                <div className="space-y-2">
                  <Label htmlFor="shelf_number" className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Nomor Rak
                  </Label>
                  <Input
                    id="shelf_number"
                    placeholder="Contoh: A-12"
                    value={formData.shelf_number}
                    onChange={(e) => handleChange('shelf_number', e.target.value)}
                    disabled={loading}
                  />
                  {errors.shelf_number && (
                    <p className="text-sm text-destructive">{errors.shelf_number}</p>
                  )}
                </div>
                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    placeholder="Deskripsi singkat tentang buku..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Kategori Buku
            </CardTitle>
            <CardDescription>
              Pilih kategori buku (dapat memilih lebih dari satu)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCategories ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-md border">
                    <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                    <div className="h-4 flex-1 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-8">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Folder className="h-12 w-12 text-amber-500" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Belum Ada Kategori</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Silakan tambahkan kategori baru terlebih dahulu di{" "}
                      <Link href="/categories" className="underline font-semibold hover:text-amber-900">
                        halaman Kategori
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.isArray(categories) && categories.map((category) => {
                    const IconComponent = category.icon ? getIconByName(category.icon) : Folder;
                    return (
                      <label
                        key={category.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all hover:bg-accent ${
                          selectedCategories.includes(category.id.toString())
                            ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20'
                            : 'border-input hover:border-emerald-200 dark:hover:border-emerald-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-input text-emerald-600 focus:ring-emerald-500"
                          checked={selectedCategories.includes(category.id.toString())}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category.id.toString()]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(id => id !== category.id.toString()));
                            }
                            // Clear error when categories selected
                            if (errors.categories) {
                              setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.categories;
                                return newErrors;
                              });
                            }
                          }}
                          disabled={loading}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                            <p className="text-sm font-medium truncate">{category.name}</p>
                          </div>
                          {category.description && (
                            <p className="text-xs text-muted-foreground dark:text-gray-400 truncate mt-0.5">{category.description}</p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
                
                {errors.categories && (
                  <p className="text-sm text-destructive">{errors.categories}</p>
                )}
                
                {selectedCategories.length > 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 p-3 border border-emerald-200 dark:border-emerald-800">
                    <Folder className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                      {selectedCategories.length} kategori dipilih
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Authors Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Penulis Buku
            </CardTitle>
            <CardDescription>
              Pilih penulis buku (dapat memilih lebih dari satu)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAuthors ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-md border">
                    <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                    <div className="h-4 flex-1 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : authors.length === 0 ? (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-8">
                <div className="flex flex-col items-center gap-3 text-center">
                  <BookOpen className="h-12 w-12 text-amber-500" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Belum Ada Penulis</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Silakan tambahkan penulis baru terlebih dahulu di{" "}
                      <Link href="/authors" className="underline font-semibold hover:text-amber-900">
                        halaman Penulis
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.isArray(authors) && authors.map((author) => (
                    <label
                      key={author.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all hover:bg-accent ${
                        selectedAuthors.includes(author.id.toString())
                          ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20'
                          : 'border-input hover:border-emerald-200 dark:hover:border-emerald-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-input text-emerald-600 focus:ring-emerald-500"
                        checked={selectedAuthors.includes(author.id.toString())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAuthors([...selectedAuthors, author.id.toString()]);
                          } else {
                            setSelectedAuthors(selectedAuthors.filter(id => id !== author.id.toString()));
                          }
                          // Clear error when authors selected
                          if (errors.authors) {
                            setErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.authors;
                              return newErrors;
                            });
                          }
                        }}
                        disabled={loading}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{author.name}</p>
                        {author.nationality && (
                          <p className="text-xs text-muted-foreground dark:text-gray-400 truncate">{author.nationality}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                
                {errors.authors && (
                  <p className="text-sm text-destructive">{errors.authors}</p>
                )}
                
                {selectedAuthors.length > 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 p-3 border border-emerald-200 dark:border-emerald-800">
                    <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                      {selectedAuthors.length} penulis dipilih
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Publication Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Detail Publikasi
            </CardTitle>
            <CardDescription>
              Informasi penerbitan dan spesifikasi buku
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Publisher Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Publisher <span className="text-destructive">*</span>
                </Label>
                <RadioGroup
                  value={publisherType}
                  onValueChange={(value: string) => setPublisherType(value as 'existing' | 'new')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="existing" id="existing" />
                    <Label htmlFor="existing" className="cursor-pointer font-normal">
                      Publisher Existing
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new" className="cursor-pointer font-normal">
                      Publisher Baru
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Existing Publisher Dropdown */}
              {publisherType === 'existing' && (
                <div className="space-y-2">
                  <Label htmlFor="publisher_id">
                    Pilih Publisher <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.publisher_id}
                    onValueChange={(value) => handleChange('publisher_id', value)}
                    disabled={loading || loadingPublishers}
                  >
                    <SelectTrigger id="publisher_id" className={publishers.length === 0 && !loadingPublishers ? "border-amber-300 bg-amber-50" : ""}>
                      <SelectValue placeholder={loadingPublishers ? "Memuat publisher..." : "Pilih publisher"} />
                    </SelectTrigger>
                    <SelectContent>
                      {publishers.length === 0 && !loadingPublishers ? (
                        <div className="p-4 text-center">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Building2 className="h-8 w-8 text-amber-500" />
                            <p className="text-sm font-medium">Belum Ada Publisher</p>
                            <p className="text-xs">Silakan tambahkan publisher baru terlebih dahulu</p>
                          </div>
                        </div>
                      ) : (
                        publishers.map((publisher) => (
                          <SelectItem key={publisher.id} value={publisher.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-emerald-600" />
                              {publisher.name}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.publisher_id && (
                    <p className="text-sm text-destructive">{errors.publisher_id}</p>
                  )}
                  {publishers.length === 0 && !loadingPublishers && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex-shrink-0">
                        <Building2 className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-amber-900">Belum ada publisher tersedia</p>
                        <p className="text-amber-700 mt-0.5">
                          Pilih <strong>"Publisher Baru"</strong> di atas atau tambahkan di{" "}
                          <Link href="/publishers" className="underline font-semibold hover:text-amber-900">
                            halaman Publishers
                          </Link>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* New Publisher Form */}
              {publisherType === 'new' && (
                <div className="space-y-4 p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200">
                  <div className="text-sm font-semibold text-emerald-900">
                    Informasi Publisher Baru
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Publisher Name */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="publisher_name">
                        Nama Publisher <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="publisher_name"
                        placeholder="Contoh: Gramedia Pustaka Utama"
                        value={publisherData.name}
                        onChange={(e) => setPublisherData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={loading}
                      />
                      {errors.publisher_name && (
                        <p className="text-sm text-destructive">{errors.publisher_name}</p>
                      )}
                    </div>

                    {/* Publisher Email */}
                    <div className="space-y-2">
                      <Label htmlFor="publisher_email">Email</Label>
                      <Input
                        id="publisher_email"
                        type="email"
                        placeholder="Contoh: info@gramedia.com"
                        value={publisherData.email}
                        onChange={(e) => setPublisherData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={loading}
                      />
                    </div>

                    {/* Publisher Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="publisher_phone">Telepon</Label>
                      <Input
                        id="publisher_phone"
                        type="tel"
                        placeholder="Contoh: 021-12345678"
                        value={publisherData.phone}
                        onChange={(e) => setPublisherData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={loading}
                      />
                    </div>

                    {/* Publisher Website */}
                    <div className="space-y-2">
                      <Label htmlFor="publisher_website">Website</Label>
                      <Input
                        id="publisher_website"
                        type="url"
                        placeholder="Contoh: https://www.gramedia.com"
                        value={publisherData.website}
                        onChange={(e) => setPublisherData(prev => ({ ...prev, website: e.target.value }))}
                        disabled={loading}
                      />
                    </div>

                    {/* Publisher City */}
                    <div className="space-y-2">
                      <Label htmlFor="publisher_city">Kota</Label>
                      <Input
                        id="publisher_city"
                        placeholder="Contoh: Jakarta"
                        value={publisherData.city}
                        onChange={(e) => setPublisherData(prev => ({ ...prev, city: e.target.value }))}
                        disabled={loading}
                      />
                    </div>

                    {/* Publisher Country */}
                    <div className="space-y-2">
                      <Label htmlFor="publisher_country">Negara</Label>
                      <Input
                        id="publisher_country"
                        placeholder="Contoh: Indonesia"
                        value={publisherData.country}
                        onChange={(e) => setPublisherData(prev => ({ ...prev, country: e.target.value }))}
                        disabled={loading}
                      />
                    </div>

                    {/* Publisher Address */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="publisher_address">Alamat</Label>
                      <Textarea
                        id="publisher_address"
                        placeholder="Alamat lengkap publisher..."
                        rows={2}
                        value={publisherData.address}
                        onChange={(e) => setPublisherData(prev => ({ ...prev, address: e.target.value }))}
                        disabled={loading}
                      />
                    </div>

                    {/* Publisher Description */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="publisher_description">Deskripsi</Label>
                      <Textarea
                        id="publisher_description"
                        placeholder="Deskripsi singkat tentang publisher..."
                        rows={3}
                        value={publisherData.description}
                        onChange={(e) => setPublisherData(prev => ({ ...prev, description: e.target.value }))}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {/* Publication Year */}
                <div className="space-y-2">
                  <Label htmlFor="publication_year">
                    Tahun Terbit <span className="text-destructive">*</span>
                  </Label>
                <Input
                  id="publication_year"
                  type="number"
                  placeholder="Contoh: 2023"
                  value={formData.publication_year}
                  onChange={(e) => handleChange('publication_year', e.target.value)}
                  disabled={loading}
                />
                {errors.publication_year && (
                  <p className="text-sm text-destructive">{errors.publication_year}</p>
                )}
              </div>

              {/* Pages */}
              <div className="space-y-2">
                <Label htmlFor="pages">
                  Jumlah Halaman <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pages"
                  type="number"
                  placeholder="Contoh: 320"
                  value={formData.pages}
                  onChange={(e) => handleChange('pages', e.target.value)}
                  disabled={loading}
                />
                {errors.pages && (
                  <p className="text-sm text-destructive">{errors.pages}</p>
                )}
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Bahasa <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="language"
                  placeholder="Contoh: Indonesian, English"
                  value={formData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  disabled={loading}
                />
                {errors.language && (
                  <p className="text-sm text-destructive">{errors.language}</p>
                )}
              </div>

              {/* Total Copies */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="total_copies">
                  Jumlah Eksemplar <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="total_copies"
                  type="number"
                  placeholder="Contoh: 5"
                  value={formData.total_copies}
                  onChange={(e) => handleChange('total_copies', e.target.value)}
                  disabled={loading}
                  className="max-w-xs"
                />
                {errors.total_copies && (
                  <p className="text-sm text-destructive">{errors.total_copies}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Jumlah total eksemplar buku yang tersedia
                </p>
              </div>
            </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 bg-gradient-to-r from-gray-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950/30 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <Link href="/books">
            <Button type="button" variant="outline" disabled={loading}>
              Batal
            </Button>
          </Link>
          <Button 
            type="submit" 
            isSubmit
            isLoading={loading}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg" style={{ background: 'linear-gradient(to right, var(--brand-primary-dark), var(--brand-primary))' }}
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Simpan Buku
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
