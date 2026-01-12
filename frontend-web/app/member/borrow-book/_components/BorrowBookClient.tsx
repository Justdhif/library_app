'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Book, FileText, ArrowLeft, Save, Package, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface BookCopy {
  id: number;
  copy_number: number;
  status: string;
  condition: string;
  book: {
    id: number;
    title: string;
    isbn: string;
    author: {
      name: string;
    };
    publisher: {
      name: string;
    };
  };
}

interface User {
  id: number;
  username: string;
  email: string;
  profile: {
    full_name: string;
  };
}

export function BorrowBookClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookCopies, setBookCopies] = useState<BookCopy[]>([]);
  const [searchBook, setSearchBook] = useState('');
  const [formData, setFormData] = useState({
    book_copy_id: '',
    notes: '',
  });

  // Get current user
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (searchBook.length >= 2) {
      searchBooks();
    } else {
      setBookCopies([]);
    }
  }, [searchBook]);

  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get('/user');
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      toast.error('Failed to load user information');
    }
  };

  const searchBooks = async () => {
    try {
      const response = await apiClient.get(`/book-copies?search=${searchBook}&status=available`);
      const data = response.data.data;
      setBookCopies(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Failed to search books:', error);
      toast.error('Failed to search books');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.book_copy_id) {
      toast.error('Please select a book to borrow');
      return;
    }

    if (!currentUser) {
      toast.error('User information not loaded');
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.post('/borrowings', {
        user_id: currentUser.id,
        book_copy_id: formData.book_copy_id,
        notes: formData.notes,
      });
      
      toast.success('Borrowing request submitted successfully', {
        description: 'Please wait for admin approval',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast.error('Failed to submit borrowing request', {
        description: error.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedBook = bookCopies.find(
    (copy) => copy.id.toString() === formData.book_copy_id
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            isSubmit 
            isLoading={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Submit Request
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Member Info Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Your Information
            </CardTitle>
            <CardDescription>
              Borrower details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentUser ? (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{currentUser.profile.full_name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm">{currentUser.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Username</Label>
                  <p className="text-sm">{currentUser.username}</p>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Loading...</div>
            )}
          </CardContent>
        </Card>

        {/* Book Selection Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Select Book
            </CardTitle>
            <CardDescription>
              Search and select the book you want to borrow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Book */}
            <div className="space-y-2">
              <Label htmlFor="book-search">Search Book</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="book-search"
                  placeholder="Search by title, ISBN, or author..."
                  value={searchBook}
                  onChange={(e) => setSearchBook(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Type at least 2 characters to search for available books
              </p>
            </div>

            {/* Book Copy Selection */}
            {bookCopies.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="book">Available Books</Label>
                <Select
                  value={formData.book_copy_id}
                  onValueChange={(value) => setFormData({ ...formData, book_copy_id: value })}
                >
                  <SelectTrigger id="book">
                    <SelectValue placeholder="Choose a book to borrow" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookCopies.map((copy) => (
                      <SelectItem key={copy.id} value={copy.id.toString()}>
                        <div className="flex flex-col py-1">
                          <span className="font-medium">{copy.book.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {copy.book.author.name} • Copy #{copy.copy_number}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {searchBook.length > 0 && bookCopies.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                {searchBook.length < 2 
                  ? 'Type at least 2 characters to search'
                  : 'No available books found'
                }
              </div>
            )}

            {/* Selected Book Details */}
            {selectedBook && (
              <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">Selected Book:</h4>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{selectedBook.book.title}</p>
                  <p className="text-muted-foreground">
                    by {selectedBook.book.author.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Published by {selectedBook.book.publisher.name}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Badge variant="outline" className="text-xs">
                      <Package className="h-3 w-3 mr-1" />
                      Copy #{selectedBook.copy_number}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {selectedBook.condition}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Additional Notes
          </CardTitle>
          <CardDescription>
            Add any additional information about this request (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="notes"
            placeholder="e.g., Preferred pickup time, special requests..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="resize-none"
          />
        </CardContent>
      </Card>
    </form>
  );
}
