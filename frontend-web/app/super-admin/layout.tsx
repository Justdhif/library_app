'use client';

import { useAuth } from '@/lib/auth';
import { useLibraryOperational } from '@/hooks/use-library-operational';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SuperAdminSidebar } from '@/components/layout/SuperAdminSidebar';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/custom-ui';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();
  // Initialize operational hook at layout level for toast warnings on all pages
  useLibraryOperational();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SuperAdminSidebar />
        <main className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 p-6 pt-0 relative">
            {isLoading ? (
              <div className="absolute inset-0 bg-background z-50">
                <LoadingScreen />
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
