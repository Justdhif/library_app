'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Book, User, FileText, ArrowLeft, Save, Mail, Phone, UserCircle, Users, Plus, X, Search, Calendar, CheckCircle, Barcode, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { format } from 'date-fns';
import { BarcodeScanner } from './BarcodeScanner';

interface User {
  id: number;
  username: string;
  email: string;
  profile: {
    full_name: string;
    phone?: string;
    address?: string;
    city?: string;
    avatar?: string;
  };
}

interface Book {
  id: number;
  title: string;
  isbn: string;
  description?: string;
  publication_year?: number;
  cover_image?: string;
  authors?: { id: number; name: string }[];
  publisher?: { id: number; name: string };
  categories?: { id: number; name: string }[];
}

interface BookCopy {
  id: number;
  barcode: string;
  copy_number: number;
  status: string;
  condition: string;
  book: Book;
}

type BorrowerType = 'registered' | 'guest';

export function QuickRequestClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [borrowerType, setBorrowerType] = useState<BorrowerType>('registered');
  
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [bookCopies, setBookCopies] = useState<BookCopy[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(true);

  const [selectedBookCopyIds, setSelectedBookCopyIds] = useState<number[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [dueDate, setDueDate] = useState<Date>();

  const [formData, setFormData] = useState({
    user_id: '',
    notes: '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchBooks();
  }, []);

  useEffect(() => {
    if (selectedBookId) {
      fetchBookCopies(selectedBookId);
    }
  }, [selectedBookId]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await apiClient.get('/users?per_page=100&role=member&status=active');
      const data = response.data.data;
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Gagal memuat daftar member');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoadingBooks(true);
      const response = await apiClient.get('/books?per_page=100');
      const data = response.data.data;
      setBooks(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Failed to fetch books:', error);
      toast.error('Gagal memuat daftar buku');
    } finally {
      setLoadingBooks(false);
    }
  };

  const fetchBookCopies = async (bookId: number) => {
    try {
      const response = await apiClient.get(`/book-copies?book_id=${bookId}&status=available`);
      const data = response.data.data;
      setBookCopies(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Failed to fetch book copies:', error);
      toast.error('Gagal memuat salinan buku');
    }
  };

  const handleBarcodeScanned = async (barcode: string) => {
    try {
      const response = await apiClient.get(`/book-copies?barcode=${barcode}&status=available`);
      const data = response.data.data;
      const copies = Array.isArray(data) ? data : data.data || [];
      
      if (copies.length === 0) {
        toast.error('Buku tidak tersedia untuk dipinjam');
        return;
      }

      const copy = copies[0];

      if (selectedBookCopyIds.includes(copy.id)) {
        toast.error('Buku sudah dipilih');
        return;
      }

      if (selectedBookCopyIds.length >= 5) {
        toast.error('Maksimal 5 buku');
        return;
      }

      setSelectedBookCopyIds([...selectedBookCopyIds, copy.id]);
      
      // Add to bookCopies if not exists
      if (!bookCopies.find(bc => bc.id === copy.id)) {
        setBookCopies([...bookCopies, copy]);
      }

      toast.success(`Buku "${copy.book.title}" berhasil ditambahkan!`);
    } catch (error: any) {
      toast.error('Gagal memproses barcode');
    }
  };

  const handleAddBookCopy = (bookCopyId: number) => {
    if (selectedBookCopyIds.includes(bookCopyId)) {
      toast.error('Salinan buku sudah ditambahkan');
      return;
    }
    if (selectedBookCopyIds.length >= 5) {
      toast.error('Maksimal 5 buku dapat dipinjam sekaligus');
      return;
    }
    setSelectedBookCopyIds([...selectedBookCopyIds, bookCopyId]);
    toast.success('Buku ditambahkan');
  };

  const handleRemoveBookCopy = (bookCopyId: number) => {
    setSelectedBookCopyIds(selectedBookCopyIds.filter(id => id !== bookCopyId));
  };

  const filteredUsers = users.filter(user =>
    memberSearchQuery === '' ||
    user.profile.full_name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  const filteredBooks = books.filter(book =>
    searchQuery === '' ||
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.authors?.some(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const availableCopiesForSelectedBook = bookCopies.filter(
    copy => !selectedBookCopyIds.includes(copy.id) && copy.book.id === selectedBookId
  );

  const selectedBooks = bookCopies.filter(copy => 
    selectedBookCopyIds.includes(copy.id)
  );

  const selectedUser = users.find(
    (user) => user.id.toString() === formData.user_id
  );

  const selectedBook = books.find(book => book.id === selectedBookId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedBookCopyIds.length === 0) {
      toast.error('Pilih minimal satu buku');
      return;
    }

    if (!dueDate) {
      toast.error('Pilih tanggal jatuh tempo');
      return;
    }

    if (borrowerType === 'registered') {
      if (!formData.user_id) {
        toast.error('Pilih member');
        return;
      }
    } else {
      if (!formData.guest_name || !formData.guest_email || !formData.guest_phone) {
        toast.error('Lengkapi informasi guest');
        return;
      }
    }

    try {
      setIsLoading(true);

      if (borrowerType === 'guest') {
        const guestUserResponse = await apiClient.post('/users', {
          username: `guest_${Date.now()}`,
          email: formData.guest_email,
          password: `temp_${Date.now()}`,
          password_confirmation: `temp_${Date.now()}`,
          role: 'guest',
          status: 'active',
          profile: {
            full_name: formData.guest_name,
            phone: formData.guest_phone,
          },
        });

        const guestUserId = guestUserResponse.data.data?.id || guestUserResponse.data.id;

        await apiClient.post('/borrowings', {
          user_id: guestUserId,
          book_copy_ids: selectedBookCopyIds,
          due_date: format(dueDate, 'yyyy-MM-dd'),
          notes: formData.notes ? `[WALK-IN GUEST] ${formData.notes}` : '[WALK-IN GUEST]',
          quick_request: true,
        });
      } else {
        await apiClient.post('/borrowings', {
          user_id: formData.user_id,
          book_copy_ids: selectedBookCopyIds,
          due_date: format(dueDate, 'yyyy-MM-dd'),
          notes: formData.notes,
          quick_request: true,
        });
      }
      
      toast.success('Peminjaman berhasil dibuat!');
      router.push('/borrowings');
    } catch (error: any) {
      toast.error('Gagal membuat peminjaman', {
        description: error.response?.data?.message || 'Terjadi kesalahan',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-linear-to-r from-emerald-600 to-emerald-500 p-8 text-white shadow-xl" style={{ background: 'linear-gradient(to right, var(--brand-primary-dark), var(--brand-primary))' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-48 translate-x-48 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-48 -translate-x-48 blur-3xl" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/borrowings">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Quick Request</h1>
                <p className="text-white/90 mt-1 text-sm">
                  Proses peminjaman cepat dengan persetujuan otomatis
                </p>
              </div>
            </div>
          </div>
          {selectedBookCopyIds.length > 0 && (
            <Badge className="text-base px-4 py-2 bg-white text-emerald-600 hover:bg-white/90 border-0 shadow-lg font-semibold">
              <Book className="h-4 w-4 mr-2" />
              {selectedBookCopyIds.length} buku dipilih
            </Badge>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Borrower Type */}
        <Card className="border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-linear-to-r from-emerald-50 to-transparent border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-lg ring-4 ring-emerald-100">
                1
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Tipe Peminjam
                </CardTitle>
                <CardDescription>
                  Pilih apakah member terdaftar atau tamu walk-in
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={borrowerType}
              onValueChange={(value) => setBorrowerType(value as BorrowerType)}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="registered" id="registered" className="peer sr-only" />
                <Label
                  htmlFor="registered"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-6 hover:bg-emerald-50 hover:border-emerald-200 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50 [&:has([data-state=checked])]:border-emerald-500 cursor-pointer transition-all"
                >
                  <User className="mb-3 h-8 w-8 peer-data-[state=checked]:text-emerald-600" />
                  <div className="text-center">
                    <div className="font-semibold text-lg">Member Terdaftar</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Memiliki akun di sistem
                    </div>
                  </div>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="guest" id="guest" className="peer sr-only" />
                <Label
                  htmlFor="guest"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-6 hover:bg-emerald-50 hover:border-emerald-200 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50 [&:has([data-state=checked])]:border-emerald-500 cursor-pointer transition-all"
                >
                  <UserCircle className="mb-3 h-8 w-8 peer-data-[state=checked]:text-emerald-600" />
                  <div className="text-center">
                    <div className="font-semibold text-lg">Tamu Walk-in</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Tidak perlu akun
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Step 2: Member/Guest Information */}
        <Card className="border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-linear-to-r from-emerald-50 to-transparent border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-lg ring-4 ring-emerald-100">
                2
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {borrowerType === 'registered' ? (
                    <>
                      <User className="h-5 w-5" />
                      Informasi Member
                    </>
                  ) : (
                    <>
                      <UserCircle className="h-5 w-5" />
                      Informasi Tamu
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {borrowerType === 'registered'
                    ? 'Pilih member terdaftar dari daftar'
                    : 'Masukkan detail tamu (akun sementara untuk tracking)'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {borrowerType === 'registered' ? (
              <div className="space-y-4">
                {/* Search Members */}
                <div className="space-y-2">
                  <Label>Cari Member</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari berdasarkan nama, email, atau username..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Selected Member Preview */}
                {selectedUser && (
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-lg shadow-sm">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 ring-2 ring-emerald-200">
                        <AvatarImage src={selectedUser.profile.avatar} />
                        <AvatarFallback className="bg-emerald-500 text-white text-lg font-bold">
                          {selectedUser.profile.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="font-semibold text-lg">{selectedUser.profile.full_name}</p>
                          <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{selectedUser.email}</span>
                          </div>
                          {selectedUser.profile.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{selectedUser.profile.phone}</span>
                            </div>
                          )}
                          {selectedUser.profile.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{selectedUser.profile.city}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({ ...formData, user_id: '' })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Members List */}
                {!selectedUser && (
                  <div className="space-y-2">
                    {loadingUsers ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading members...
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {memberSearchQuery ? 'Tidak ada member yang cocok' : 'Tidak ada member aktif'}
                      </div>
                    ) : (
                      <div className="grid gap-2 max-h-100 overflow-y-auto border rounded-lg p-2">
                        {filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, user_id: user.id.toString() })}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left"
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user.profile.avatar} />
                              <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                                {user.profile.full_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{user.profile.full_name}</p>
                              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                              {user.profile.phone && (
                                <p className="text-xs text-muted-foreground">{user.profile.phone}</p>
                              )}
                            </div>
                            <Badge variant="secondary">Pilih</Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guest_name">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="guest_name"
                      placeholder="Masukkan nama lengkap tamu"
                      value={formData.guest_name}
                      onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guest_email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="guest_email"
                      type="email"
                      placeholder="tamu@example.com"
                      value={formData.guest_email}
                      onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="guest_phone">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="guest_phone"
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={formData.guest_phone}
                      onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Catatan:</strong> Tamu walk-in adalah pengunjung yang tidak ingin membuat akun. 
                    Data sementara akan dibuat hanya untuk tracking peminjaman.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Book Selection with Barcode Scanner */}
        <Card className="border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-linear-to-r from-emerald-50 to-transparent border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-lg ring-4 ring-emerald-100">
                3
              </div>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Pilih Buku
                </CardTitle>
                <CardDescription>
                  Scan barcode atau pilih buku secara manual (maksimal 5 buku)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selected Books Summary */}
            {selectedBooks.length > 0 && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    Buku Terpilih ({selectedBooks.length}/5)
                  </Label>
                </div>
                <div className="grid gap-2">
                  {selectedBooks.map((copy) => (
                    <div
                      key={copy.id}
                      className="flex items-center gap-3 p-3 bg-background rounded-lg border"
                    >
                      {copy.book.cover_image && (
                        <div className="relative w-12 h-16">
                          <Image
                            src={copy.book.cover_image}
                            alt={copy.book.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{copy.book.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {copy.book.authors?.[0]?.name || 'Unknown Author'}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Copy #{copy.copy_number}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {copy.barcode}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveBookCopy(copy.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Tabs defaultValue="barcode" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="barcode" className="flex items-center gap-2">
                  <Barcode className="h-4 w-4" />
                  Scan Barcode
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Pilih Manual
                </TabsTrigger>
              </TabsList>

              <TabsContent value="barcode" className="space-y-4 mt-4">
                <BarcodeScanner onScan={handleBarcodeScanned} />
              </TabsContent>

              <TabsContent value="manual" className="space-y-4 mt-4">
                {/* Search Books */}
                <div className="space-y-2">
                  <Label>Cari Buku</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari berdasarkan judul, penulis, atau ISBN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Books Grid */}
                <div className="space-y-4">
                  {loadingBooks ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading buku...
                    </div>
                  ) : filteredBooks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'Tidak ada buku yang cocok' : 'Tidak ada buku tersedia'}
                    </div>
                  ) : (
                    <div className="grid gap-3 max-h-125 overflow-y-auto border rounded-lg p-3">
                      {filteredBooks.slice(0, 20).map((book) => (
                        <button
                          key={book.id}
                          type="button"
                          onClick={() => setSelectedBookId(book.id)}
                          className={`flex items-start gap-4 p-4 rounded-lg border transition-all text-left ${
                            selectedBookId === book.id
                              ? 'bg-primary/10 border-primary'
                              : 'bg-card hover:bg-accent'
                          }`}
                        >
                          {book.cover_image && (
                            <div className="relative w-16 h-20">
                              <Image
                                src={book.cover_image}
                                alt={book.title}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{book.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {book.authors?.map(a => a.name).join(', ') || 'Unknown Author'}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {book.isbn && (
                                <Badge variant="secondary" className="text-xs">
                                  ISBN: {book.isbn}
                                </Badge>
                              )}
                              {book.publication_year && (
                                <Badge variant="secondary" className="text-xs">
                                  {book.publication_year}
                                </Badge>
                              )}
                              {book.publisher && (
                                <Badge variant="secondary" className="text-xs">
                                  {book.publisher.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {selectedBookId === book.id && (
                            <Badge variant="default">Dipilih</Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Book Copies for Selected Book */}
                {selectedBook && availableCopiesForSelectedBook.length > 0 && (
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                    <Label className="text-base font-semibold">
                      Salinan Tersedia untuk "{selectedBook.title}"
                    </Label>
                    <div className="grid gap-2">
                      {availableCopiesForSelectedBook.map((copy) => (
                        <div
                          key={copy.id}
                          className="flex items-center justify-between p-3 bg-background rounded-lg border"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Barcode className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono text-sm">{copy.barcode}</span>
                            </div>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                Copy #{copy.copy_number}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {copy.condition}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleAddBookCopy(copy.id)}
                            disabled={selectedBookCopyIds.length >= 5}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Tambah
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedBook && availableCopiesForSelectedBook.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Tidak ada salinan tersedia untuk buku ini
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Step 4: Due Date & Notes */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-linear-to-r from-emerald-50 to-transparent border-b">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-lg ring-4 ring-emerald-100">
                  4
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    Tanggal Jatuh Tempo
                  </CardTitle>
                  <CardDescription>
                    Pilih kapan buku harus dikembalikan
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Label htmlFor="due_date" className="text-sm font-semibold">
                  Due Date <span className="text-red-500">*</span>
                </Label>
                <DatePicker
                  date={dueDate}
                  onDateChange={setDueDate}
                  placeholder="Pilih tanggal jatuh tempo"
                  disablePast={true}
                />
                <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <Calendar className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-emerald-700">
                    Pilih tanggal pengembalian buku. Tanggal harus di masa depan (besok atau lebih).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-linear-to-r from-gray-50 to-transparent border-b">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-gray-400 to-gray-500 text-white flex items-center justify-center font-bold text-sm shadow-lg ring-4 ring-gray-100">
                  5
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    Catatan Tambahan
                  </CardTitle>
                  <CardDescription>
                    Informasi tambahan (opsional)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Textarea
                id="notes"
                placeholder="Masukkan catatan tambahan di sini..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={5}
                className="resize-none focus:border-emerald-300 focus:ring-emerald-200"
              />
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-emerald-100 -mx-6 px-6 py-4 mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedBookCopyIds.length > 0 && dueDate ? (
                <span className="text-emerald-600 font-medium">
                  ✓ Siap untuk dibuat peminjaman
                </span>
              ) : (
                <span>
                  Lengkapi semua informasi yang diperlukan
                </span>
              )}
            </p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/borrowings')}
                disabled={isLoading}
                size="lg"
                className="hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button 
                type="submit" 
                isSubmit
                isLoading={isLoading}
                disabled={selectedBookCopyIds.length === 0 || !dueDate || (borrowerType === 'registered' && !formData.user_id)}
                size="lg"
                className="min-w-55 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Buat Peminjaman
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
