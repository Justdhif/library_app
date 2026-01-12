<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LibrarySetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LibrarySettingController extends Controller
{
    /**
     * Get all library settings
     */
    public function index(): JsonResponse
    {
        $settings = LibrarySetting::all();

        $formattedSettings = [];
        foreach ($settings as $setting) {
            $formattedSettings[$setting->key] = [
                'value' => $this->castValue($setting->value, $setting->type),
                'type' => $setting->type,
                'description' => $setting->description,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $formattedSettings,
        ]);
    }

    /**
     * Get specific setting
     */
    public function show(string $key): JsonResponse
    {
        $value = LibrarySetting::get($key);

        if ($value === null) {
            return response()->json([
                'success' => false,
                'message' => 'Setting not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $value,
        ]);
    }

    /**
     * Update library settings
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'operating_hours_mode' => 'sometimes|string|in:custom,weekdays,everyday',
            'opening_time' => 'sometimes|string|date_format:H:i',
            'closing_time' => 'sometimes|string|date_format:H:i',
            'closed_on_holidays' => 'sometimes|boolean',
            'closed_on_weekends' => 'sometimes|boolean',
            'custom_closed_days' => 'sometimes|array',
            'custom_closed_days.*' => 'integer|min:0|max:6',
        ]);

        foreach ($validated as $key => $value) {
            $type = match($key) {
                'closed_on_holidays', 'closed_on_weekends' => 'boolean',
                'custom_closed_days' => 'json',
                default => 'string',
            };

            LibrarySetting::set($key, $value, $type);
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully',
        ]);
    }

    /**
     * Cast value based on type
     */
    private function castValue($value, string $type)
    {
        return match($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($value, true),
            'integer' => (int) $value,
            'float' => (float) $value,
            default => $value,
        };
    }
}
