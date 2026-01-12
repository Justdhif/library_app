import { Card, CardContent } from '@/components/ui/card';

export function TableSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          {/* Cover Image Skeleton */}
          <div className="w-full aspect-[3/4] bg-muted animate-pulse" />
          
          {/* Content Skeleton */}
          <CardContent className="p-4 space-y-3">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-5 bg-muted rounded w-full animate-pulse" />
              <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
            </div>

            {/* ISBN */}
            <div className="h-4 bg-muted rounded w-32 animate-pulse" />

            {/* Publisher & Year */}
            <div className="space-y-1.5">
              <div className="h-3 bg-muted rounded w-40 animate-pulse" />
              <div className="h-3 bg-muted rounded w-24 animate-pulse" />
            </div>

            {/* Bottom Section */}
            <div className="flex items-center justify-between pt-2">
              <div className="h-4 bg-muted rounded w-20 animate-pulse" />
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
