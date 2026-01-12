import { BorrowingsHeader } from './_components/BorrowingsHeader';
import { BorrowingsClient } from './_components/BorrowingsClient';

export default function BorrowingsPage() {
  return (
    <div className='p-6 space-y-6'>
      <BorrowingsHeader />
      <BorrowingsClient />
    </div>
  );
}
