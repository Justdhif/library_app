'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function BookCopiesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-2">
          <CardContent className="p-4">
            {/* Header - Status & Condition */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-7 w-7 rounded" />
                <Skeleton className="h-7 w-7 rounded" />
              </div>
            </div>

            {/* Barcode */}
            <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Details */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Stats */}
            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-8" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
