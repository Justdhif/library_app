import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-emerald-200 dark:bg-emerald-900/30 rounded-full opacity-20 blur-2xl" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-teal-200 dark:bg-teal-900/30 rounded-full opacity-20 blur-2xl" />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-emerald-300 dark:bg-emerald-800/30 rounded-full opacity-10 blur-xl" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full">
        <RegisterForm />
      </div>
    </div>
  );
}
