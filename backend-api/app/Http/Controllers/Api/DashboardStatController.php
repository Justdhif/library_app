<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Borrowing;
use App\Models\BookReturn;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class DashboardStatController extends Controller
{
    /**
     * Get calendar statistics for a specific month
     */
    public function getCalendarStats(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'year' => 'required|integer|min:2020|max:2100',
            'month' => 'required|integer|min:1|max:12',
        ]);

        $year = $validated['year'];
        $month = $validated['month'];

        // Get start and end of the month
        $startDate = Carbon::create($year, $month, 1)->startOfDay();
        $endDate = $startDate->copy()->endOfMonth()->endOfDay();

        // Get borrowings per day
        $borrowings = Borrowing::whereBetween('borrowed_date', [$startDate, $endDate])
            ->selectRaw('DATE(borrowed_date) as date, COUNT(*) as count')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        // Get returns per day
        $returns = BookReturn::whereBetween('returned_date', [$startDate, $endDate])
            ->selectRaw('DATE(returned_date) as date, COUNT(*) as count')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        // Format data for each day in the month
        $calendarData = [];
        $currentDate = $startDate->copy();

        while ($currentDate <= $endDate) {
            $dateString = $currentDate->toDateString();

            $calendarData[] = [
                'date' => $dateString,
                'day' => $currentDate->day,
                'dayName' => $currentDate->locale('id')->dayName,
                'borrowings' => $borrowings->get($dateString)?->count ?? 0,
                'returns' => $returns->get($dateString)?->count ?? 0,
            ];

            $currentDate->addDay();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'year' => $year,
                'month' => $month,
                'monthName' => Carbon::create($year, $month, 1)->locale('id')->monthName,
                'days' => $calendarData,
            ],
        ]);
    }

    /**
     * Get overall dashboard statistics
     */
    public function getOverallStats(): JsonResponse
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        $stats = [
            'today' => [
                'borrowings' => Borrowing::whereDate('borrowed_date', $today)->count(),
                'returns' => BookReturn::whereDate('returned_date', $today)->count(),
            ],
            'this_month' => [
                'borrowings' => Borrowing::whereDate('borrowed_date', '>=', $thisMonth)->count(),
                'returns' => BookReturn::whereDate('returned_date', '>=', $thisMonth)->count(),
            ],
            'active_borrowings' => Borrowing::where('status', 'active')->count(),
            'overdue_borrowings' => Borrowing::where('status', 'active')
                ->where('due_date', '<', now())
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
