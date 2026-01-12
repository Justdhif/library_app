import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Plus, Zap } from 'lucide-react';
import Link from 'next/link';

export function BorrowingsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Borrowings Management</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage all book borrowings
        </p>
      </div>
      <Link href="/borrowings/quick-request">
        <Button>
          <Zap className="h-4 w-4 mr-2" />
          Quick Request
        </Button>
      </Link>
    </div>
  );
}
