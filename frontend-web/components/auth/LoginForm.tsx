'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { BookOpen, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData);
      toast.success(t('auth.loginSuccess'));
    } catch (error: any) {
      const message = error.response?.data?.message || t('auth.loginError');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-0">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 rounded-l-3xl p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        <div className="relative z-10 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl mb-4 animate-bounce-slow">
            <BookOpen className="w-14 h-14 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight">
            {t('branding.digitalLibrary').split(' ')[0]}
            <br />
            {t('branding.digitalLibrary').split(' ')[1]}
          </h1>
          <p className="text-emerald-50 text-lg max-w-md">
            {t('branding.tagline')}
          </p>
          <div className="flex items-center justify-center gap-8 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-emerald-100 text-sm">{t('branding.bookCollection')}</div>
            </div>
            <div className="w-px h-12 bg-white/30" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">5K+</div>
              <div className="text-emerald-100 text-sm">{t('branding.activeMembers')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl lg:rounded-l-none lg:rounded-r-3xl shadow-2xl p-8 lg:p-12 border dark:border-gray-800">
        <div className="max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl">
              <BookOpen className="w-9 h-9 text-white" strokeWidth={2} />
            </div>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {t('auth.welcomeBack')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              {t('auth.pleaseLogin')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                {t('auth.emailAddress')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                  className="pl-12 h-12 border-2 border-gray-200 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
                  {t('auth.password')}
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                  className="pl-12 h-12 border-2 border-gray-200 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              isSubmit
              isLoading={isLoading}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t('common.processing')}
                </>
              ) : (
                <>
                  {t('auth.login')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">{t('common.or')}</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {t('auth.dontHaveAccount')}{' '}
                <Link
                  href="/register"
                  className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold hover:underline underline-offset-4"
                >
                  {t('auth.registerNow')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
