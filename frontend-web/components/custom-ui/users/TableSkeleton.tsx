export function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index} className="animate-pulse">
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded"></div>
                <div className="h-3 w-24 bg-muted rounded"></div>
              </div>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="space-y-2">
              <div className="h-4 w-48 bg-muted rounded"></div>
              <div className="h-3 w-32 bg-muted rounded"></div>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="h-6 w-20 bg-muted rounded-full"></div>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center justify-end gap-2">
              <div className="h-8 w-8 bg-muted rounded"></div>
              <div className="h-8 w-8 bg-muted rounded"></div>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
