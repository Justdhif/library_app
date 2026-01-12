import { PublishersHeader } from './_components/PublishersHeader';
import { PublishersClient } from './_components/PublishersClient';

export default function PublishersPage() {
  return (
    <div className="p-6 space-y-6">
      <PublishersHeader />
      <PublishersClient />
    </div>
  );
}
