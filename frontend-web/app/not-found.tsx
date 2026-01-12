'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { Home, Search, ArrowLeft, BookOpen } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()
  const { user } = useAuth()
  const [dashboardPath] = useState('/dashboard')
  const [roleName, setRoleName] = useState('Member')

  useEffect(() => {
    if (user?.profile?.role) {
      // Format role name untuk display
      const role = user.profile.role
      const formattedRole = role.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
      setRoleName(formattedRole)
    }
  }, [user])

  const handleBack = () => {
    // Try to go back in history first
    if (window.history.length > 1) {
      router.back()
    } else {
      // If no history, go to dashboard
      router.push(dashboardPath)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-[180px] font-bold text-emerald-500/20 dark:text-emerald-500/10 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-500/30 blur-3xl rounded-full" />
              <BookOpen className="w-24 h-24 text-emerald-600 dark:text-emerald-400 relative animate-bounce-slow" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Maaf, halaman yang Anda cari tidak dapat ditemukan atau mungkin telah dipindahkan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={handleBack}
            size="lg"
            variant="outline"
            className="gap-2 min-w-[180px]"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </Button>
          
          <Link href={dashboardPath}>
            <Button
              size="lg"
              className="gap-2 min-w-[180px] bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Home className="w-5 h-5" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Suggestions */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Atau coba navigasi berikut:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href={dashboardPath}>
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/books">
              <Button variant="ghost" size="sm" className="gap-2">
                <Search className="w-4 h-4" />
                Cari Buku
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profil Saya
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Code */}
        <div className="text-xs text-gray-400 dark:text-gray-600">
          Error Code: 404 | Page Not Found
        </div>
      </div>
    </div>
  )
}
