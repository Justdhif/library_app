'use client';

export function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="border-b">
          <td className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-3 w-40 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </td>
          <td className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-14 bg-muted rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-28 bg-muted rounded animate-pulse" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-28 bg-muted rounded animate-pulse" />
          </td>
          <td className="px-4 py-4">
            <div className="h-6 w-20 bg-muted rounded animate-pulse" />
          </td>
          <td className="px-4 py-4 text-right">
            <div className="h-8 w-8 bg-muted rounded animate-pulse ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}
