"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileInput } from "@/components/custom-ui/file-input";
import { Separator } from "@/components/ui/separator";
import { booksApi } from "@/lib/api/books";
import { bookCopiesApi, BookCopy as BookCopyType } from "@/lib/api/bookCopies";
import { categoriesApi } from "@/lib/api/categories";
import { publishersApi } from "@/lib/api/publishers";
import { authorsApi } from "@/lib/api/authors";
import type { Book, Category, Publisher, Author } from "@/lib/types/api";
import { toast } from "sonner";
import { ArrowLeft, Save, Pencil, Star, BookOpen, Trash2, Package, Calendar, Globe, FileText, Hash, Upload, Folder, MapPin, Package2, Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getIconByName } from "@/lib/utils/iconMapping";
import Link from "next/link";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { BookCopiesSection } from "@/components/custom-ui/books/detail/BookCopiesSection";
import { BookCopyDialog } from "@/components/custom-ui/books/detail/BookCopyDialog";
import { BookDetailSkeleton } from "@/components/custom-ui/books/detail/BookDetailSkeleton";
import Image from "next/image";

const bookSchema = z.object({
  title: z.string().min(1, "Judul harus diisi").max(255, "Judul terlalu panjang"),
  isbn: z.string().min(10, "ISBN minimal 10 karakter").max(20, "ISBN maksimal 20 karakter"),
  publisher_id: z.string().min(1, "Publisher harus dipilih"),
  publication_year: z.string()
    .min(4, "Tahun publikasi harus 4 digit")
    .max(4, "Tahun publikasi harus 4 digit")
    .refine((val) => {
      const year = parseInt(val);
      const currentYear = new Date().getFullYear();
      return year >= 1900 && year <= currentYear + 1;
    }, "Tahun publikasi tidak valid"),
  pages: z.string()
    .min(1, "Jumlah halaman harus diisi")
    .refine((val) => parseInt(val) > 0, "Jumlah halaman harus lebih dari 0"),
  language: z.string().min(1, "Bahasa harus diisi").max(50, "Bahasa terlalu panjang"),
  condition: z.enum(["new", "good", "fair", "poor", "damaged"]),
  location: z.string().optional(),
  shelf_number: z.string().optional(),
  description: z.string().optional(),
  cover_image: z.string().url("URL cover image tidak valid").optional().or(z.literal("")),
  total_copies: z.string()
    .min(1, "Jumlah eksemplar harus diisi")
    .refine((val) => parseInt(val) > 0, "Jumlah eksemplar harus lebih dari 0"),
});

type BookFormData = z.infer<typeof bookSchema>;

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = parseInt(params.id as string);

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Publishers state
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loadingPublishers, setLoadingPublishers] = useState(true);
  
  // Authors state
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  
  // Categories state - untuk multiple selection
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Cover image state
  const [coverImage, setCoverImage] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Book Copies state
  const [bookCopies, setBookCopies] = useState<BookCopyType[]>([]);
  const [loadingCopies, setLoadingCopies] = useState(true);
  const [copiesPage, setCopiesPage] = useState(1);
  const copiesPerPage = 6;
  const [copyDialog, setCopyDialog] = useState<{
    open: boolean;
    copy: BookCopyType | null;
  }>({
    open: false,
    copy: null,
  });
  const [deleteCopyDialog, setDeleteCopyDialog] = useState<{
    open: boolean;
    copy: BookCopyType | null;
  }>({
    open: false,
    copy: null,
  });
  const [isSubmittingCopy, setIsSubmittingCopy] = useState(false);
  const [isDeletingCopy, setIsDeletingCopy] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
  });

  useEffect(() => {
    fetchBook();
    fetchBookCopies();
    fetchCategories();
    fetchPublishers();
    fetchAuthors();
  }, [bookId]);

  // Cleanup preview URL on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await categoriesApi.getAll({ is_active: true, per_page: 100 });
      setCategories(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Gagal memuat daftar kategori');
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchPublishers = async () => {
    try {
      setLoadingPublishers(true);
      const data = await publishersApi.getAll({ is_active: true, per_page: 100 });
      setPublishers(data.data);
    } catch (error) {
      console.error('Error fetching publishers:', error);
      toast.error('Gagal memuat daftar publisher');
    } finally {
      setLoadingPublishers(false);
    }
  };

  const fetchAuthors = async () => {
    try {
      setLoadingAuthors(true);
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

  const fetchBook = async () => {
    try {
      setLoading(true);
      const data = await booksApi.getById(bookId);
      setBook(data);
      setPreviewUrl(data.cover_image || "");
      
      // Set selected authors from book data
      if (data.authors && Array.isArray(data.authors)) {
        setSelectedAuthors(data.authors.map(author => author.id.toString()));
      }
      
      // Set selected categories from book data
      if (data.categories && Array.isArray(data.categories)) {
        setSelectedCategories(data.categories.map(category => category.id.toString()));
      }
      
      reset({
        title: data.title,
        isbn: data.isbn,
        publisher_id: data.publisher_id?.toString() || "",
        publication_year: data.publication_year?.toString() || "",
        pages: data.pages?.toString() || "",
        language: data.language || "",
        condition: ((data as any).condition as "new" | "good" | "fair" | "poor" | "damaged") || "good",
        location: (data as any).location || "",
        shelf_number: (data as any).shelf_number || "",
        description: data.description || "",
        cover_image: data.cover_image || "",
        total_copies: data.total_copies?.toString() || "",
      });
    } catch (error: any) {
      console.error("Error fetching book:", error);
      toast.error("Gagal memuat data buku");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookCopies = async () => {
    try {
      setLoadingCopies(true);
      const data = await bookCopiesApi.getByBookId(bookId);
      setBookCopies(data);
    } catch (error: any) {
      console.error("Error fetching book copies:", error);
      toast.error("Gagal memuat data salinan buku");
    } finally {
      setLoadingCopies(false);
    }
  };

  const handleAddCopy = () => {
    setCopyDialog({ open: true, copy: null });
  };

  const handleEditCopy = (copy: BookCopyType) => {
    setCopyDialog({ open: true, copy });
  };

  const handleDeleteCopy = (copy: BookCopyType) => {
    setDeleteCopyDialog({ open: true, copy });
  };

  const handleSubmitCopy = async (data: any) => {
    try {
      setIsSubmittingCopy(true);
      const formData = {
        ...data,
        book_id: bookId,
        acquisition_price: data.acquisition_price ? parseFloat(data.acquisition_price) : undefined,
      };

      if (copyDialog.copy) {
        await bookCopiesApi.update(bookId, copyDialog.copy.id, formData);
        toast.success("Salinan buku berhasil diperbarui");
      } else {
        await bookCopiesApi.create(bookId, formData);
        toast.success("Salinan buku berhasil ditambahkan");
      }

      setCopyDialog({ open: false, copy: null });
      fetchBookCopies();
      fetchBook();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menyimpan salinan buku");
    } finally {
      setIsSubmittingCopy(false);
    }
  };

  const handleConfirmDeleteCopy = async () => {
    if (!deleteCopyDialog.copy) return;

    try {
      setIsDeletingCopy(true);
      await bookCopiesApi.delete(bookId, deleteCopyDialog.copy.id);
      toast.success("Salinan buku berhasil dihapus");
      setDeleteCopyDialog({ open: false, copy: null });
      fetchBookCopies();
      fetchBook();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus salinan buku");
    } finally {
      setIsDeletingCopy(false);
    }
  };

  const onSubmit = async (data: BookFormData) => {
    try {
      // Validate authors selection
      if (selectedAuthors.length === 0) {
        toast.error("Minimal pilih satu penulis");
        return;
      }
      
      // Validate categories selection
      if (selectedCategories.length === 0) {
        toast.error("Minimal pilih satu kategori");
        return;
      }
      
      setIsSubmitting(true);
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('title', data.title);
      formDataToSend.append('isbn', data.isbn);
      formDataToSend.append('publisher_id', data.publisher_id);
      formDataToSend.append('publication_year', data.publication_year);
      formDataToSend.append('pages', data.pages);
      formDataToSend.append('language', data.language);
      formDataToSend.append('condition', data.condition);
      formDataToSend.append('total_copies', data.total_copies);
      
      // Required fields with defaults (for backend compatibility)
      formDataToSend.append('format', 'paperback'); // Default format
      
      // Add selected categories
      if (selectedCategories.length > 0) {
        selectedCategories.forEach((categoryId) => {
          formDataToSend.append('categories[]', categoryId);
        });
      }
      
      // Add selected authors
      if (selectedAuthors.length > 0) {
        selectedAuthors.forEach((authorId) => {
          formDataToSend.append('authors[]', authorId);
        });
      }
      
      if (data.description) {
        formDataToSend.append('description', data.description);
      }
      
      if (data.location) {
        formDataToSend.append('location', data.location);
      }
      
      if (data.shelf_number) {
        formDataToSend.append('shelf_number', data.shelf_number);
      }
      
      // Add cover image file if selected
      if (coverImage) {
        formDataToSend.append('cover_image', coverImage);
      } else if (data.cover_image) {
        formDataToSend.append('cover_image', data.cover_image);
      }

      await booksApi.update(bookId, formDataToSend);
      toast.success("Buku berhasil diperbarui");
      setIsEditing(false);
      setCoverImage(undefined);
      fetchBook();
    } catch (error: any) {
      console.error("Error updating book:", error);
      toast.error(error.response?.data?.message || "Gagal memperbarui buku");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await booksApi.delete(bookId);
      toast.success("Buku berhasil dihapus");
      router.push("/books");
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus buku");
    } finally {
      setIsDeleting(false);
      setDeleteDialog(false);
    }
  };

  if (loading) {
    return <BookDetailSkeleton />;
  }

  if (!book) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header - Same as Add Form */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white shadow-lg" style={{ background: 'linear-gradient(to right, var(--brand-primary-dark), var(--brand-primary))' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-32 -translate-x-32" />
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
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
                <h1 className="text-3xl font-bold">{isEditing ? "Edit Buku" : "Detail Buku"}</h1>
                <p className="text-white/90 mt-1">
                  {isEditing ? "Perbarui informasi buku" : "Lihat dan kelola informasi buku"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-emerald-600 hover:bg-white/90 shadow-lg"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Buku
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialog(true)}
                  className="border-white/30 text-white hover:bg-white/20 transition-all duration-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsEditing(false);
                    setCoverImage(undefined);
                    setPreviewUrl(book.cover_image || "");
                    reset();
                  }}
                  disabled={isSubmitting}
                  className="border-white/30 text-white hover:bg-white/20 transition-all duration-300"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  form="book-edit-form"
                  isSubmit
                  isLoading={isSubmitting}
                  className="bg-white text-emerald-600 hover:bg-white/90 shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Form - Always visible with 2 column layout */}
      <form id="book-edit-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                {!isEditing ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border-4 border-emerald-200 shadow-lg">
                      {previewUrl ? (
                        <Image
                          src={previewUrl}
                          alt="Cover preview"
                          fill
                          className="object-cover"
                          priority
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30">
                          <BookOpen className="h-16 w-16 text-emerald-300 dark:text-emerald-700" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">Cover buku</p>
                  </div>
                ) : (
                  <FileInput
                    variant="square"
                    id="cover_image_file"
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
                    disabled={isSubmitting}
                    fallbackIcon={<BookOpen className="h-16 w-16 text-emerald-300 dark:text-emerald-700" />}
                    onError={(message) => toast.error(message)}
                  />
                )}
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
                        {...register("title")}
                        disabled={!isEditing || isSubmitting}
                        className={!isEditing ? "bg-gray-50 dark:bg-gray-800/50" : ""}
                      />
                      {errors.title && (
                        <p className="text-sm text-destructive">{errors.title.message}</p>
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
                        {...register("isbn")}
                        disabled={!isEditing || isSubmitting}
                        className={!isEditing ? "bg-gray-50 dark:bg-gray-800/50" : ""}
                      />
                      {errors.isbn && (
                        <p className="text-sm text-destructive">{errors.isbn.message}</p>
                      )}
                    </div>

                    {/* Condition */}
                    <div className="space-y-2">
                      <Label htmlFor="condition" className="flex items-center gap-2">
                        <Package2 className="h-4 w-4" />
                        Kondisi <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={watch("condition")}
                        onValueChange={(value) => setValue("condition", value as any)}
                        disabled={!isEditing || isSubmitting}
                      >
                        <SelectTrigger id="condition" className={!isEditing ? "bg-gray-50 dark:bg-gray-800/50" : ""}>
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
                        <p className="text-sm text-destructive">{errors.condition.message}</p>
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
                        {...register("location")}
                        disabled={!isEditing || isSubmitting}
                        className={!isEditing ? "bg-gray-50 dark:bg-gray-800/50" : ""}
                      />
                      {errors.location && (
                        <p className="text-sm text-destructive">{errors.location.message}</p>
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
                        {...register("shelf_number")}
                        disabled={!isEditing || isSubmitting}
                        className={!isEditing ? "bg-gray-50 dark:bg-gray-800/50" : ""}
                      />
                      {errors.shelf_number && (
                        <p className="text-sm text-destructive">{errors.shelf_number.message}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Deskripsi</Label>
                      <Textarea
                        id="description"
                        placeholder="Deskripsi singkat tentang buku..."
                        rows={4}
                        {...register("description")}
                        disabled={!isEditing || isSubmitting}
                        className={!isEditing ? "bg-gray-50 dark:bg-gray-800/50" : ""}
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
                    {[1, 2, 3].map((i) => (
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
                          Silakan tambahkan kategori baru terlebih dahulu
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
                            } ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-input text-emerald-600 focus:ring-emerald-500"
                              checked={selectedCategories.includes(category.id.toString())}
                              onChange={(e) => {
                                if (isEditing) {
                                  if (e.target.checked) {
                                    setSelectedCategories([...selectedCategories, category.id.toString()]);
                                  } else {
                                    setSelectedCategories(selectedCategories.filter(id => id !== category.id.toString()));
                                  }
                                }
                              }}
                              disabled={!isEditing || isSubmitting}
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
                    
                    {selectedCategories.length === 0 && isEditing && (
                      <p className="text-sm text-destructive">Minimal pilih satu kategori</p>
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

            {/* Authors Selection */}
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
                    {[1, 2, 3].map((i) => (
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
                          Silakan tambahkan penulis baru terlebih dahulu
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
                          } ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-input text-emerald-600 focus:ring-emerald-500"
                            checked={selectedAuthors.includes(author.id.toString())}
                            onChange={(e) => {
                              if (isEditing) {
                                if (e.target.checked) {
                                  setSelectedAuthors([...selectedAuthors, author.id.toString()]);
                                } else {
                                  setSelectedAuthors(selectedAuthors.filter(id => id !== author.id.toString()));
                                }
                              }
                            }}
                            disabled={!isEditing || isSubmitting}
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
                    
                    {selectedAuthors.length === 0 && isEditing && (
                      <p className="text-sm text-destructive">Minimal pilih satu penulis</p>
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
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Publisher Dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor="publisher_id" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Publisher <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={watch("publisher_id")}
                      onValueChange={(value) => setValue("publisher_id", value)}
                      disabled={!isEditing || isSubmitting || loadingPublishers}
                    >
                      <SelectTrigger 
                        id="publisher_id"
                        className={!isEditing ? "bg-gray-50 dark:bg-gray-800/50" : publishers.length === 0 && !loadingPublishers ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700" : ""}
                      >
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
                      <p className="text-sm text-destructive">{errors.publisher_id.message}</p>
                    )}
                  </div>

                  {/* Publication Year */}
                  <div className="space-y-2">
                    <Label htmlFor="publication_year">
                      Tahun Terbit <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="publication_year"
                      type="number"
                      {...register("publication_year")}
                      disabled={!isEditing || isSubmitting}
                      className={!isEditing ? "bg-gray-50 dark:bg-gray-800/50" : ""}
                    />
                    {errors.publication_year && (
                      <p className="text-sm text-destructive">
                        {errors.publication_year.message}
                      </p>
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
                      {...register("pages")}
                      disabled={!isEditing || isSubmitting}
                      className={!isEditing ? "bg-gray-50 dark:bg-gray-800/50" : ""}
                    />
                    {errors.pages && (
                      <p className="text-sm text-destructive">{errors.pages.message}</p>
                    )}
                  </div>

                  {/* Language */}
                  <div className="space-y-2">
                    <Label htmlFor="language">
                      Bahasa <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="language"
                      {...register("language")}
                      disabled={!isEditing || isSubmitting}
                      className={!isEditing ? "bg-gray-50 dark:bg-gray-800/50" : ""}
                    />
                    {errors.language && (
                      <p className="text-sm text-destructive">{errors.language.message}</p>
                    )}
                  </div>

                  {/* Total Copies */}
                  <div className="space-y-2">
                    <Label htmlFor="total_copies">
                      Jumlah Eksemplar <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="total_copies"
                      type="number"
                      {...register("total_copies")}
                      disabled={!isEditing || isSubmitting}
                      className={!isEditing ? "bg-gray-50 dark:bg-gray-800/50" : ""}
                    />
                    {errors.total_copies && (
                      <p className="text-sm text-destructive">{errors.total_copies.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Book Copies Section - Always visible */}
          {book && (
            <div className="mt-6">
              <BookCopiesSection
                copies={bookCopies.slice((copiesPage - 1) * copiesPerPage, copiesPage * copiesPerPage)}
                loading={loadingCopies}
                totalCopies={book.total_copies}
                bookTitle={book.title}
                onAddCopy={handleAddCopy}
                onEditCopy={handleEditCopy}
                onDeleteCopy={handleDeleteCopy}
                totalCopiesInDb={bookCopies.length}
                currentPage={copiesPage}
                copiesPerPage={copiesPerPage}
                onPageChange={setCopiesPage}
              />
            </div>
          )}

          {/* Dialogs */}
          {book && (
            <>
              <BookCopyDialog
                open={copyDialog.open}
                onOpenChange={(open) => setCopyDialog({ open, copy: null })}
                onSubmit={handleSubmitCopy}
                copy={copyDialog.copy}
                isLoading={isSubmittingCopy}
                totalCopies={book.total_copies}
                currentCopiesCount={bookCopies.length}
              />

              <DeleteConfirmation
                open={deleteDialog}
                onOpenChange={setDeleteDialog}
                onConfirm={handleDelete}
                title="Hapus Buku"
                description={`Apakah Anda yakin ingin menghapus buku "${book.title}"? Tindakan ini tidak dapat dibatalkan.`}
                isLoading={isDeleting}
              />

              <DeleteConfirmation
                open={deleteCopyDialog.open}
                onOpenChange={(open) => setDeleteCopyDialog({ open, copy: null })}
                onConfirm={handleConfirmDeleteCopy}
                title="Hapus Salinan Buku"
                description={`Apakah Anda yakin ingin menghapus salinan dengan barcode "${deleteCopyDialog.copy?.barcode}"? Tindakan ini tidak dapat dibatalkan.`}
                isLoading={isDeletingCopy}
              />
            </>
          )}
      </div>
    );
  }
