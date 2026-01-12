import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export function ReturnsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Returns Management</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage all book returns
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
