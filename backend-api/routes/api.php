<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\BookCopyController;
use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\PublisherController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BorrowingController;
use App\Http\Controllers\Api\ReturnController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\FineController;
use App\Http\Controllers\Api\FineTypeController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\LibrarySettingController;
use App\Http\Controllers\Api\DashboardStatController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Public book browsing
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/featured', [BookController::class, 'featured']);
Route::get('/books/search', [BookController::class, 'search']);
Route::get('/books/{book}', [BookController::class, 'show']);
Route::get('/books/{book}/availability', [BookController::class, 'availability']);

// Public authors
Route::get('/authors', [AuthorController::class, 'index']);
Route::get('/authors/{author}', [AuthorController::class, 'show']);

// Public publishers
Route::get('/publishers', [PublisherController::class, 'index']);
Route::get('/publishers/{publisher}', [PublisherController::class, 'show']);

// Public categories
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/tree', [CategoryController::class, 'tree']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// Public tags
Route::get('/tags', [TagController::class, 'index']);
Route::get('/tags/popular', [TagController::class, 'popular']);
Route::get('/tags/{tag}', [TagController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/change-password', [AuthController::class, 'changePassword']);

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    // User routes
    Route::apiResource('users', UserController::class);
    Route::post('/users/{user}', [UserController::class, 'update']); // For file upload support
    Route::put('/users/{user}/status', [UserController::class, 'updateStatus']);
    Route::get('/users/{user}/borrowings', [UserController::class, 'borrowingHistory']);
    Route::get('/users/{user}/fines', [UserController::class, 'fineHistory']);

    // Book management routes (protected)
    Route::post('/books', [BookController::class, 'store']);
    Route::put('/books/{book}', [BookController::class, 'update']);
    Route::delete('/books/{book}', [BookController::class, 'destroy']);

    // Book copy routes
    Route::get('/books/{book}/copies', [BookCopyController::class, 'byBook']);
    Route::get('/books/{book}/copies/available', [BookCopyController::class, 'available']);
    Route::apiResource('book-copies', BookCopyController::class);

    // Author management routes (protected)
    Route::post('/authors', [AuthorController::class, 'store']);
    Route::put('/authors/{author}', [AuthorController::class, 'update']);
    Route::delete('/authors/{author}', [AuthorController::class, 'destroy']);

    // Publisher management routes (protected)
    Route::post('/publishers', [PublisherController::class, 'store']);
    Route::put('/publishers/{publisher}', [PublisherController::class, 'update']);
    Route::delete('/publishers/{publisher}', [PublisherController::class, 'destroy']);

    // Category management routes (protected)
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // Borrowing routes
    Route::get('/borrowings', [BorrowingController::class, 'index']);
    Route::post('/borrowings', [BorrowingController::class, 'store']);
    Route::get('/borrowings/stats', [BorrowingController::class, 'stats']);
    Route::get('/borrowings/overdue', [BorrowingController::class, 'overdue']);
    Route::get('/borrowings/my', [BorrowingController::class, 'myBorrowings']);
    Route::get('/borrowings/{borrowing}', [BorrowingController::class, 'show']);
    Route::post('/borrowings/{borrowing}/approve', [BorrowingController::class, 'approve']);
    Route::post('/borrowings/{borrowing}/renew', [BorrowingController::class, 'renew']);
    Route::post('/borrowings/{borrowing}/cancel', [BorrowingController::class, 'cancel']);

    // Return routes
    Route::get('/returns', [ReturnController::class, 'index']);
    Route::post('/returns', [ReturnController::class, 'store']);
    Route::get('/returns/stats', [ReturnController::class, 'stats']);
    Route::get('/returns/search', [ReturnController::class, 'search']);
    Route::get('/returns/export', [ReturnController::class, 'export']);
    Route::get('/returns/{return}', [ReturnController::class, 'show']);
    Route::post('/returns/{return}/pay-fine', [ReturnController::class, 'payFine']);
    Route::post('/returns/{return}/waive-fine', [ReturnController::class, 'waiveFine']);
    Route::post('/returns/{return}/approve', [ReturnController::class, 'approve']);
    Route::post('/returns/{return}/reject', [ReturnController::class, 'reject']);

    // Fine Type routes
    Route::get('/fine-types', [FineTypeController::class, 'index']);
    Route::get('/fine-types/by-condition', [FineTypeController::class, 'getByCondition']);

    // Reservation routes
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::get('/reservations/stats', [ReservationController::class, 'stats']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/reservations/my', [ReservationController::class, 'myReservations']);
    Route::get('/reservations/{reservation}', [ReservationController::class, 'show']);
    Route::post('/reservations/{reservation}/approve', [ReservationController::class, 'approve']);
    Route::post('/reservations/{reservation}/reject', [ReservationController::class, 'reject']);
    Route::post('/reservations/{reservation}/ready', [ReservationController::class, 'markAsReady']);
    Route::post('/reservations/{reservation}/fulfill', [ReservationController::class, 'fulfill']);
    Route::post('/reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);
    Route::get('/books/{book}/reservations/queue', [ReservationController::class, 'queue']);

    // Fine routes
    Route::get('/fines', [FineController::class, 'index']);
    Route::get('/fines/unpaid', [FineController::class, 'unpaid']);
    Route::get('/fines/summary', [FineController::class, 'summary']);
    Route::get('/fines/my', [FineController::class, 'myFines']);
    Route::get('/fines/{fine}', [FineController::class, 'show']);
    Route::post('/fines/{fine}/pay', [FineController::class, 'pay']);
    Route::post('/fines/{fine}/waive', [FineController::class, 'waive']);

    // Comment routes
    Route::get('/comments', [CommentController::class, 'index']);
    Route::post('/comments', [CommentController::class, 'store']);
    Route::get('/comments/pending', [CommentController::class, 'pending']);
    Route::get('/comments/flagged', [CommentController::class, 'flagged']);
    Route::get('/comments/{comment}', [CommentController::class, 'show']);
    Route::put('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
    Route::post('/comments/{comment}/approve', [CommentController::class, 'approve']);
    Route::post('/comments/{comment}/flag', [CommentController::class, 'flag']);
    Route::post('/comments/{comment}/like', [CommentController::class, 'like']);

    // Rating routes
    Route::get('/ratings', [RatingController::class, 'index']);
    Route::post('/ratings', [RatingController::class, 'store']);
    Route::get('/ratings/verified', [RatingController::class, 'verified']);
    Route::get('/ratings/my', [RatingController::class, 'myRating']);
    Route::get('/ratings/{rating}', [RatingController::class, 'show']);
    Route::put('/ratings/{rating}', [RatingController::class, 'update']);
    Route::delete('/ratings/{rating}', [RatingController::class, 'destroy']);
    Route::post('/ratings/{rating}/helpful', [RatingController::class, 'helpful']);
    Route::post('/ratings/{rating}/not-helpful', [RatingController::class, 'notHelpful']);

    // Tag management routes (protected)
    Route::post('/tags', [TagController::class, 'store']);
    Route::put('/tags/{tag}', [TagController::class, 'update']);
    Route::delete('/tags/{tag}', [TagController::class, 'destroy']);
    Route::post('/tags/{tag}/attach', [TagController::class, 'attachToBook']);
    Route::post('/tags/{tag}/detach', [TagController::class, 'detachFromBook']);

    // Library Settings routes
    Route::get('/settings', [LibrarySettingController::class, 'index']);
    Route::get('/settings/{key}', [LibrarySettingController::class, 'show']);
    Route::put('/settings', [LibrarySettingController::class, 'update']);

    // Dashboard Statistics routes
    Route::get('/dashboard/calendar-stats', [DashboardStatController::class, 'getCalendarStats']);
    Route::get('/dashboard/overall-stats', [DashboardStatController::class, 'getOverallStats']);
});
