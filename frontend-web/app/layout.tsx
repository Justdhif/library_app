import type { Metadata } from "next";
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { LanguageProvider } from '@/lib/language-context';
import { Toaster } from '@/components/ui/sonner';
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";

export const metadata: Metadata = {
  title: "Library App - Sistem Perpustakaan",
  description: "Aplikasi manajemen perpustakaan digital",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <LanguageProvider>
            <NextTopLoader 
              color="#10B981" 
              height={3} 
              showSpinner={false}
              easing="ease"
              speed={200}
              shadow="0 0 10px #10B981,0 0 5px #10B981"
              template='<div class="bar" role="bar"><div class="peg"></div></div>'
              zIndex={99999}
            />
            <AuthProvider>
              {children}
              <Toaster 
                position="top-right"
                duration={4000}
                closeButton
                richColors
                toastOptions={{
                  unstyled: false,
                  classNames: {
                    toast: 'backdrop-blur-md bg-white/90 dark:bg-gray-950/90 border border-gray-200 dark:border-gray-800 shadow-xl rounded-2xl p-4 min-w-[350px]',
                    title: 'text-gray-900 dark:text-gray-100 font-semibold text-base leading-tight',
                    description: 'text-gray-600 dark:text-gray-400 text-sm mt-1 leading-snug',
                    actionButton: 'bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg px-4 py-2 transition-all duration-200 shadow-sm',
                    cancelButton: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg px-4 py-2 transition-all duration-200',
                    closeButton: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 border-0 transition-all duration-200',
                    error: '!bg-red-50/95 dark:!bg-red-950/40 !border-red-300 dark:!border-red-800 shadow-xl shadow-red-500/20',
                    success: '!bg-emerald-50/95 dark:!bg-emerald-950/40 !border-emerald-300 dark:!border-emerald-800 shadow-xl shadow-emerald-500/20',
                    warning: '!bg-amber-50/95 dark:!bg-amber-950/40 !border-amber-300 dark:!border-amber-800 shadow-xl shadow-amber-500/20',
                    info: '!bg-blue-50/95 dark:!bg-blue-950/40 !border-blue-300 dark:!border-blue-800 shadow-xl shadow-blue-500/20',
                    loading: '!bg-gray-50/95 dark:!bg-gray-900/40 !border-gray-300 dark:!border-gray-700',
                  },
                }}
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
