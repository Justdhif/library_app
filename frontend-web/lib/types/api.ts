// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Profile {
  id: number;
  user_id: number;
  role: 'super-admin' | 'admin' | 'librarian' | 'member';
  full_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  avatar?: string;
  bio?: string;
  member_card_number?: string;
  membership_start_date?: string;
  membership_expiry_date?: string;
  created_at: string;
  updated_at: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirmation: string;
  full_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  bio?: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

// Book Types
export interface Book {
  id: number;
  title: string;
  slug: string;
  isbn: string;
  description?: string;
  publication_year?: number;
  published_date?: string;
  pages?: number;
  language: string;
  cover_image?: string;
  publisher_id: number;
  category_id: number;
  average_rating?: number;
  total_ratings?: number;
  total_copies: number;
  available_copies: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  publisher?: Publisher;
  category?: Category;
  authors?: Author[];
  tags?: Tag[];
  categories?: Category[];
}

export interface SocialLink {
  id?: number;
  platform: string;
  url: string;
}

export interface Author {
  id: number;
  name: string;
  slug: string;
  biography?: string;
  birth_date?: string;
  death_date?: string;
  nationality?: string;
  photo?: string;
  social_links?: SocialLink[];
  books_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Publisher {
  id: number;
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  icon?: string;
  order?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: Category[];
  parent?: Category;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// Borrowing Types
export interface Borrowing {
  id: number;
  user_id: number;
  book_copy_id: number;
  borrowed_date: string;
  due_date: string;
  return_date?: string;
  status: 'pending' | 'approved' | 'rejected' | 'borrowed' | 'returned' | 'overdue' | 'cancelled';
  notes?: string;
  return_notes?: string;
  approved_by?: number;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  book_copy?: BookCopy;
}

export interface BookCopy {
  id: number;
  book_id: number;
  barcode: string;
  call_number?: string;
  condition: 'new' | 'good' | 'fair' | 'poor' | 'damaged';
  status: 'available' | 'borrowed' | 'reserved' | 'lost' | 'maintenance' | 'retired';
  location?: string;
  shelf_number?: string;
  acquisition_date?: string;
  acquisition_price?: number;
  times_borrowed: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  book?: Book;
}

// Reservation Types
export interface Reservation {
  id: number;
  user_id: number;
  book_id: number;
  book_copy_id?: number;
  reservation_date: string;
  expiry_date: string;
  status: 'pending' | 'ready' | 'fulfilled' | 'cancelled' | 'expired';
  queue_position: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  book?: Book;
  book_copy?: BookCopy;
}

// Fine Types
export interface Fine {
  id: number;
  user_id: number;
  borrowing_id: number;
  type: 'overdue' | 'damage' | 'lost' | 'other';
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  due_date: string;
  paid_date?: string;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'waived';
  payment_method?: string;
  payment_reference?: string;
  waived_by?: number;
  waive_reason?: string;
  waived_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  borrowing?: Borrowing;
}

// Rating Types
export interface Rating {
  id: number;
  user_id: number;
  ratable_type: string;
  ratable_id: number;
  rating: number; // 1-5
  review?: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
}

// Comment Types
export interface Comment {
  id: number;
  user_id: number;
  commentable_type: string;
  commentable_id: number;
  parent_id?: number;
  content: string;
  is_approved: boolean;
  is_flagged: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
  replies?: Comment[];
  parent?: Comment;
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T = any> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}
