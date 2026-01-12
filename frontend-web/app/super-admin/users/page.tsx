import { UsersHeader } from '@/components/custom-ui/users/UsersHeader';
import { UsersClient } from '@/components/custom-ui/users/UsersClient';

export default function UsersPage() {
  return (
    <div className="p-6 space-y-6">
      <UsersHeader />
      <UsersClient />
    </div>
  );
}
