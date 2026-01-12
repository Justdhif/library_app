'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/language-context';
import { useLibraryOperational } from '@/hooks/use-library-operational';
import NProgress from 'nprogress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BookMarked,
  Settings,
  Activity,
  FileText,
  Crown,
  ChevronRight,
  LogOut,
  Building2,
  Folder,
  RotateCcw,
} from 'lucide-react';

const mainNavigationItems = [
  {
    title: 'sidebar.dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    title: 'sidebar.userManagement',
    icon: Users,
    href: '/users',
  },
];

const catalogNavigationItems = [
  {
    title: 'sidebar.books',
    icon: BookOpen,
    href: '/books',
  },
  {
    title: 'sidebar.authors',
    icon: Users,
    href: '/authors',
  },
  {
    title: 'sidebar.categories',
    icon: Folder,
    href: '/categories',
  },
  {
    title: 'sidebar.publishers',
    icon: Building2,
    href: '/publishers',
  },
];

const circulationNavigationItems = [
  {
    title: 'sidebar.borrowings',
    icon: BookMarked,
    href: '/borrowings',
  },
  {
    title: 'sidebar.returns',
    icon: RotateCcw,
    href: '/returns',
  },
];

const systemNavigationItems = [
  {
    title: 'sidebar.reports',
    icon: FileText,
    href: '/reports',
  },
];

export function SuperAdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const { t } = useLanguage();
  const { open } = useSidebar();
  const { isOperational, isLoading: isLoadingStatus } = useLibraryOperational();

  const handleNavigation = (href: string) => {
    NProgress.start();
    router.push(href);
  };

  const handleProfileClick = () => {
    NProgress.start();
    router.push('/profile');
  };

  const handleLogout = async () => {
    NProgress.start();
    await logout();
    router.push('/login');
  };

  return (
    <Sidebar collapsible="icon" variant='floating'>
      <SidebarHeader className="border-b bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <div className={`flex items-center gap-3 py-4 ${open ? 'px-4' : 'justify-center'}`}>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 text-white shrink-0 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-100 dark:ring-emerald-900/50">
            <Crown className="h-5 w-5" />
          </div>
          {open && (
            <div className="flex flex-col flex-1 gap-1.5">
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Bookera</span>
              {/* Operational Status Badge */}
              {!isLoadingStatus && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all w-fit ${
                  isOperational 
                    ? 'bg-green-100 dark:bg-green-950/50 ring-1 ring-green-200 dark:ring-green-900' 
                    : 'bg-red-100 dark:bg-red-950/50 ring-1 ring-red-200 dark:ring-red-900'
                }`}>
                  <span className={`inline-flex h-1.5 w-1.5 rounded-full ${
                    isOperational ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isOperational 
                      ? 'text-green-700 dark:text-green-400' 
                      : 'text-red-700 dark:text-red-400'
                  }`}>
                    {isOperational ? t('sidebar.open') : t('sidebar.close')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {/* Main Menu Section */}
          {open ? (
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider px-3">
              {t('sidebar.mainMenu')}
            </SidebarGroupLabel>
          ) : (
            <div className="flex items-center justify-center w-full py-2 mb-1">
              <div className="h-0.5 w-8 bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full" />
            </div>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={!open ? 'flex flex-col items-center' : ''}>
              {/* Main Navigation Items */}
              {mainNavigationItems.map((item, index) => {
                const isActive = pathname === item.href;
                const gradients = [
                  'from-blue-500 to-cyan-500',
                  'from-violet-500 to-purple-500',
                ];
                return (
                  <SidebarMenuItem key={item.href} className={!open ? 'w-full flex justify-center' : ''}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => handleNavigation(item.href)}
                      tooltip={t(item.title)}
                      className={`group/item ${!open && 'justify-center px-0 mx-auto'}`}
                    >
                      <div className={`${open ? 'p-1.5' : 'p-2'} rounded-lg bg-gradient-to-br ${gradients[index]} text-white shadow-sm group-hover/item:shadow-md transition-shadow`}>
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      {open && <span className="font-medium">{t(item.title)}</span>}
                      {isActive && open && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Catalog Group Divider */}
              {open ? (
                <div className="px-3 pt-4 pb-2">
                  <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                    {t('sidebar.catalog')}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full py-3">
                  <div className="h-0.5 w-8 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent rounded-full" />
                </div>
              )}

              {/* Catalog Items */}
              {catalogNavigationItems.map((item, index) => {
                const isActive = pathname === item.href;
                const gradients = [
                  'from-amber-500 to-orange-500',
                  'from-orange-500 to-red-500',
                  'from-yellow-500 to-amber-500',
                  'from-red-500 to-pink-500',
                ];
                return (
                  <SidebarMenuItem key={item.href} className={!open ? 'w-full flex justify-center' : ''}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => handleNavigation(item.href)}
                      tooltip={t(item.title)}
                      className={`group/item ${!open && 'justify-center px-0 mx-auto'}`}
                    >
                      <div className={`${open ? 'p-1.5' : 'p-2'} rounded-lg bg-gradient-to-br ${gradients[index]} text-white shadow-sm group-hover/item:shadow-md transition-shadow`}>
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      {open && <span className="font-medium">{t(item.title)}</span>}
                      {isActive && open && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Transactions Group Divider */}
              {open ? (
                <div className="px-3 pt-4 pb-2">
                  <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                    {t('sidebar.transactions')}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full py-3">
                  <div className="h-0.5 w-8 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent rounded-full" />
                </div>
              )}

              {/* Transactions Items */}
              {circulationNavigationItems.map((item, index) => {
                const isActive = pathname === item.href;
                const gradients = [
                  'from-emerald-500 to-teal-500',
                  'from-teal-500 to-cyan-500',
                ];
                return (
                  <SidebarMenuItem key={item.href} className={!open ? 'w-full flex justify-center' : ''}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => handleNavigation(item.href)}
                      tooltip={t(item.title)}
                      className={`group/item ${!open && 'justify-center px-0 mx-auto'}`}
                    >
                      <div className={`${open ? 'p-1.5' : 'p-2'} rounded-lg bg-gradient-to-br ${gradients[index]} text-white shadow-sm group-hover/item:shadow-md transition-shadow`}>
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      {open && <span className="font-medium">{t(item.title)}</span>}
                      {isActive && open && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* System Group Divider */}
              {open ? (
                <div className="px-3 pt-4 pb-2">
                  <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                    System
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full py-3">
                  <div className="h-0.5 w-8 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent rounded-full" />
                </div>
              )}

              {/* System Navigation Items */}
              {systemNavigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href} className={!open ? 'w-full flex justify-center' : ''}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => handleNavigation(item.href)}
                      tooltip={t(item.title)}
                      className={`group/system ${!open && 'justify-center px-0 mx-auto'}`}
                    >
                      <div className={`${open ? 'p-1.5' : 'p-2'} rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-sm group-hover/system:shadow-md transition-shadow`}>
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      {open && <span className="font-medium">{t(item.title)}</span>}
                      {isActive && open && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-950/20 dark:to-gray-950/20">
        <SidebarMenu className={!open ? 'flex flex-col items-center' : ''}>
          <SidebarMenuItem className={!open ? 'w-full flex justify-center' : ''}>
            <SidebarMenuButton
              onClick={() => handleNavigation('/activity-logs')}
              isActive={pathname === '/activity-logs'}
              tooltip={t('sidebar.activityLogs')}
              className={`group/activity ${!open && 'justify-center px-0 mx-auto'}`}
            >
              <div className={`${open ? 'p-1.5' : 'p-2'} rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-sm group-hover/activity:shadow-md transition-shadow`}>
                <Activity className="h-3.5 w-3.5" />
              </div>
              {open && <span className="font-medium">{t('sidebar.activityLogs')}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className={!open ? 'w-full flex justify-center' : ''}>
            <SidebarMenuButton
              onClick={() => handleNavigation('/settings')}
              isActive={pathname === '/settings'}
              tooltip={t('sidebar.settings')}
              className={`group/settings ${!open && 'justify-center px-0 mx-auto'}`}
            >
              <div className={`${open ? 'p-1.5' : 'p-2'} rounded-lg bg-gradient-to-br from-slate-600 to-gray-600 text-white shadow-sm group-hover/settings:shadow-md transition-shadow`}>
                <Settings className="h-3.5 w-3.5" />
              </div>
              {open && <span className="font-medium">{t('sidebar.settings')}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className={!open ? 'w-full flex justify-center' : ''}>
            <SidebarMenuButton
              onClick={handleLogout}
              className={`group/logout hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-950/20 dark:hover:to-rose-950/20 transition-all ${!open && 'justify-center px-0 mx-auto'}`}
              tooltip={t('sidebar.logout')}
            >
              <div className={`${open ? 'p-1.5' : 'p-2'} rounded-lg bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-sm group-hover/logout:shadow-md group-hover/logout:scale-105 transition-all`}>
                <LogOut className="h-3.5 w-3.5" />
              </div>
              {open && <span className="font-medium text-red-600 dark:text-red-400">{t('sidebar.logout')}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            {isLoading ? (
              <div className={`h-auto py-3 px-2 ${!open && 'flex justify-center'}`}>
                <div className={`flex items-center w-full ${open ? 'gap-3' : 'justify-center'}`}>
                  {/* Avatar Skeleton */}
                  <div className="relative shrink-0">
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  </div>
                  
                  {open && (
                    <div className="flex flex-col items-start flex-1 min-w-0 gap-1.5">
                      {/* Name Skeleton */}
                      <div className="h-3.5 bg-muted rounded w-24 animate-pulse" />
                      {/* Email Skeleton */}
                      <div className="h-3 bg-muted rounded w-32 animate-pulse" />
                      {/* Role Skeleton */}
                      <div className="h-2.5 bg-muted rounded w-16 animate-pulse mt-0.5" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <SidebarMenuButton
                onClick={handleProfileClick}
                className={`h-auto py-3 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 dark:hover:from-emerald-950/20 dark:hover:to-teal-950/20 transition-all group/profile rounded-xl ${!open && 'justify-center'}`}
                tooltip={user?.profile?.full_name || user?.username}
              >
                <div className={`flex items-center w-full ${open ? 'gap-3' : 'justify-center'}`}>
                  <div className="relative shrink-0">
                    <Avatar className="h-9 w-9 ring-2 ring-emerald-200/50 dark:ring-emerald-800/50 group-hover/profile:ring-emerald-400/70 dark:group-hover/profile:ring-emerald-600/70 transition-all group-hover/profile:scale-105 shadow-md">
                      <AvatarImage
                        src={user?.profile?.avatar}
                        alt="Avatar"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-semibold">{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 border-2 border-background shadow-sm animate-pulse" />
                  </div>
                  {open && (
                    <>
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <span className="text-sm font-semibold truncate w-full group-hover/profile:text-emerald-700 dark:group-hover/profile:text-emerald-400 transition-colors">
                          {user?.profile?.full_name || user?.username}
                        </span>
                        <span className="text-xs text-muted-foreground truncate w-full">
                          {user?.email}
                        </span>
                        <span className="text-[10px] font-medium text-emerald-600/80 dark:text-emerald-400/80 truncate w-full mt-0.5 flex items-center gap-1">
                          <span className="inline-flex h-1 w-1 rounded-full bg-emerald-500" />
                          {user?.profile?.role?.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover/profile:text-emerald-600 dark:group-hover/profile:text-emerald-400 group-hover/profile:translate-x-1 transition-all shrink-0" />
                    </>
                  )}
                </div>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
