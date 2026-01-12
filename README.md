# 📚 Bookera - Modern Library Management System

<div align="center">

![Bookera Logo](https://img.shields.io/badge/Bookera-Library%20Management-10b981?style=for-the-badge)
![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=flat-square&logo=laravel&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)

**A comprehensive, modern library management system built with Laravel & Next.js**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Screenshots](#-screenshots)

</div>

---

## 🌟 Overview

Bookera is a full-stack library management system designed for modern libraries. It provides a complete solution for managing books, users, borrowing transactions, and library operations with an intuitive, responsive interface and powerful backend API.

### ✨ Key Highlights

- 🎨 **Modern UI/UX** - Clean, intuitive interface built with shadcn/ui and Tailwind CSS
- 🌍 **Multi-language Support** - English and Indonesian (Bahasa Indonesia)
- 🌓 **Dark Mode** - System, light, and dark theme options
- 🔐 **Role-based Access Control** - Super Admin, Admin, Librarian, and Member roles
- ⏰ **Operational Hours Management** - Real-time library status with WIB timezone
- 📊 **Comprehensive Dashboard** - Statistics, analytics, and quick actions
- 🔄 **Real-time Updates** - Live operational status and notifications
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

---

## 🎯 Features

### 📖 Catalog Management
- **Books**: Add, edit, delete, and search books with detailed information
- **Authors**: Manage book authors with full profile support
- **Categories**: Organize books by categories and genres
- **Publishers**: Track book publishers and their publications

### 👥 User Management
- **Multi-role System**: Super Admin, Admin, Librarian, Member
- **User Profiles**: Complete profile management with avatars
- **Access Control**: Granular permissions per role
- **Activity Tracking**: Comprehensive user activity logs

### 📚 Circulation
- **Borrowing System**: Easy checkout process with due date tracking
- **Returns Management**: Quick return processing with fine calculations
- **Overdue Tracking**: Automatic overdue detection and notifications
- **Fine Management**: Flexible fine calculation and payment tracking

### ⚙️ System Settings
- **Operational Hours**: Configure library opening/closing times
- **Holiday Management**: Set closed days and holidays
- **Weekend Configuration**: Flexible weekend closure options
- **Theme Settings**: Light, dark, and system theme options
- **Language Settings**: Switch between English and Indonesian

### 📊 Reports & Analytics
- **Dashboard Statistics**: Real-time library metrics
- **Activity Calendar**: Visual representation of library activities
- **User Analytics**: Track user engagement and behavior
- **Transaction Reports**: Detailed borrowing and return reports

---

## 🛠️ Tech Stack

### Backend (Laravel API)
```
Laravel 11.x      - PHP Framework
SQLite           - Database (easily swappable to MySQL/PostgreSQL)
Laravel Sanctum  - API Authentication
PHP 8.2+         - Programming Language
Composer         - Dependency Management
```

### Frontend (Next.js)
```
Next.js 15       - React Framework
TypeScript       - Type Safety
Tailwind CSS     - Utility-first CSS
shadcn/ui        - UI Components
next-themes      - Theme Management
next-intl        - Internationalization
Sonner           - Toast Notifications
Axios            - HTTP Client
```

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **PHP** >= 8.2 ([Download](https://www.php.net/downloads))
- **Composer** >= 2.0 ([Download](https://getcomposer.org/download/))
- **Node.js** >= 18.0 ([Download](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)

### 📥 Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd library_app
```

#### 2. Backend Setup (Laravel API)

```bash
# Navigate to backend directory
cd backend-api

# Copy environment file
cp .env.example .env

# Install PHP dependencies
composer install

# Generate application key (auto-fills APP_KEY)
php artisan key:generate

# Create SQLite database and run migrations with seeders
touch database/database.sqlite
php artisan migrate --seed

# Start development server
php artisan serve
```

**Backend will run at:** `http://localhost:8000`

✅ **No additional configuration needed!** The default settings use SQLite and work out of the box.

#### 3. Frontend Setup (Next.js)

```bash
# Navigate to frontend directory (from root)
cd frontend-web

# Copy environment file
cp .env.example .env

# IMPORTANT: Generate secret keys for security
# Run these commands and copy the output to .env file:

# For NEXT_PUBLIC_SECRET_KEY (copy output)
openssl rand -base64 32

# For COOKIE_SECRET (copy output)
openssl rand -base64 24

# Edit .env and paste the generated keys
# nano .env  # or use your preferred editor

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend will run at:** `http://localhost:3000`

### 🔐 Default Login Credentials

After running `php artisan migrate --seed`, use these credentials:

| Role          | Email                      | Password   |
|---------------|----------------------------|------------|
| Super Admin   | superadmin@library.com     | password   |
| Admin         | admin@library.com          | password   |
| Librarian     | librarian@library.com      | password   |
| Member        | member@library.com         | password   |

⚠️ **Important:** Change these passwords in production!

---

## 📁 Project Structure

```
library_app/
│
├── backend-api/              # Laravel Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/  # API Controllers
│   │   │   └── Requests/     # Form Validation
│   │   ├── Models/           # Eloquent Models
│   │   ├── Policies/         # Authorization Policies
│   │   └── Services/         # Business Logic
│   ├── database/
│   │   ├── migrations/       # Database Migrations
│   │   └── seeders/          # Database Seeders
│   ├── routes/
│   │   ├── api.php          # API Routes
│   │   └── web.php          # Web Routes
│   └── .env.example         # Environment Template
│
└── frontend-web/            # Next.js Frontend
    ├── app/                 # App Router Pages
    │   ├── super-admin/    # Super Admin Dashboard
    │   ├── admin/          # Admin Dashboard
    │   ├── librarian/      # Librarian Dashboard
    │   ├── member/         # Member Dashboard
    │   └── login/          # Login Page
    ├── components/
    │   ├── custom-ui/      # Custom Components
    │   ├── layout/         # Layout Components
    │   └── ui/             # shadcn/ui Components
    ├── hooks/              # Custom React Hooks
    ├── lib/
    │   ├── api/           # API Client & Services
    │   ├── auth/          # Authentication Logic
    │   └── translations/  # i18n JSON Files
    └── .env.example       # Environment Template
```

---

## ⚙️ Configuration

### Backend Configuration

The `.env` file in `backend-api/` is auto-configured after setup. Key settings:

```env
APP_NAME=Bookera
APP_ENV=local
APP_KEY=base64:xxx...          # Auto-generated
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite           # No MySQL required!
```

**Optional Configurations:**
- Switch to MySQL/PostgreSQL by updating `DB_*` variables
- Configure mail settings for notifications
- Set up file storage for book covers

### Frontend Configuration

Edit `frontend-web/.env`:

```env
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# Security Keys (REQUIRED - generate with openssl)
NEXT_PUBLIC_SECRET_KEY=your-32-char-secret-here
COOKIE_SECRET=your-24-char-secret-here

# Environment
NODE_ENV=development
```

**Generate Secret Keys:**
```bash
# Run in terminal and copy output to .env
openssl rand -base64 32  # For NEXT_PUBLIC_SECRET_KEY
openssl rand -base64 24  # For COOKIE_SECRET
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend-api

# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage
```

### Frontend Tests

```bash
cd frontend-web

# Run tests (if configured)
npm run test

# Run linter
npm run lint

# Type checking
npm run type-check
```

---

## 📦 Deployment

### Backend Deployment (Laravel)

```bash
cd backend-api

# Set production environment
cp .env .env.production
# Edit .env.production:
# - APP_ENV=production
# - APP_DEBUG=false
# - Generate new APP_KEY for production

# Install production dependencies
composer install --optimize-autoloader --no-dev

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations on production database
php artisan migrate --force
```

### Frontend Deployment (Next.js)

```bash
cd frontend-web

# Build for production
npm run build

# Test production build locally
npm run start

# Deploy to Vercel (recommended)
vercel deploy --prod

# Or deploy to other platforms
# Follow platform-specific instructions
```

### Production Checklist

- [ ] Update `APP_ENV=production` in backend
- [ ] Set `APP_DEBUG=false` in backend
- [ ] Generate strong `APP_KEY` for production
- [ ] Generate new secret keys for frontend
- [ ] Use production database (MySQL/PostgreSQL)
- [ ] Configure CORS properly
- [ ] Enable HTTPS/SSL
- [ ] Set up proper backup strategy
- [ ] Configure error logging
- [ ] Set up monitoring tools

---

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues

**Error: "Please provide an encryption key"**
```bash
php artisan key:generate
```

**Database not found**
```bash
touch database/database.sqlite
php artisan migrate:fresh --seed
```

**Port 8000 already in use**
```bash
php artisan serve --port=8001
```

#### Frontend Issues

**Error: "Connection refused"**
- Ensure backend is running: `php artisan serve`
- Check `.env` file: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api`

**Error: "Invalid secret key"**
- Generate proper secret keys using `openssl rand -base64 32`
- Ensure keys are at least 32 and 24 characters respectively

**Port 3000 already in use**
```bash
npm run dev -- -p 3001
```

### Debug Mode

Enable detailed error logging:

**Backend:**
```env
APP_DEBUG=true
LOG_LEVEL=debug
```

**Frontend:**
- Check browser console for errors
- Use React DevTools for component inspection

---

## 📖 API Documentation

### Authentication

All API endpoints require authentication via Bearer token:

```bash
Authorization: Bearer {token}
```

### Key Endpoints

```
POST   /api/auth/login        - User login
POST   /api/auth/logout       - User logout
GET    /api/auth/me           - Get current user

GET    /api/books             - List books
POST   /api/books             - Create book
GET    /api/books/{id}        - Get book details
PUT    /api/books/{id}        - Update book
DELETE /api/books/{id}        - Delete book

GET    /api/users             - List users
POST   /api/users             - Create user
GET    /api/users/{id}        - Get user details

GET    /api/borrowings        - List borrowings
POST   /api/borrowings        - Create borrowing
POST   /api/borrowings/{id}/return  - Return book

GET    /api/settings          - Get library settings
PUT    /api/settings          - Update settings
```

For complete API documentation, see [API_DOCS.md](./API_DOCS.md) (if available).

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- **Backend:** Follow PSR-12 coding standards
- **Frontend:** Use ESLint and Prettier configurations
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Development Team** - *Initial work*

---

## 🙏 Acknowledgments

- [Laravel](https://laravel.com/) - The PHP Framework for Web Artisans
- [Next.js](https://nextjs.org/) - The React Framework for Production
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

## 📞 Support

For support, email support@bookera.com or open an issue in the repository.

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced reporting system
- [ ] Email notifications
- [ ] Book reservation system
- [ ] Fine payment integration
- [ ] Barcode/QR code scanning
- [ ] Multi-library support
- [ ] Advanced search with filters
- [ ] Book recommendations
- [ ] Reading statistics

---

<div align="center">

**[⬆ Back to Top](#-bookera---modern-library-management-system)**

Made with ❤️ by the Bookera Team

</div>
