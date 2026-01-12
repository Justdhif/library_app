import { BorrowBookHeader } from './_components/BorrowBookHeader';
import { BorrowBookClient } from './_components/BorrowBookClient';

export default function MemberBorrowBookPage() {
  return (
    <div className="space-y-6">
      <BorrowBookHeader />
      <BorrowBookClient />
    </div>
  );
}
