import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageToggle } from './LanguageToggle';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { t, isRTL } = useLanguage();
  const navigat = useNavigate()
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = isAdmin
    ? [
      { href: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
      { href: '/task-entry', icon: ClipboardList, label: t('nav.entry') },
    ]
    : [{ href: '/my-stats', icon: LayoutDashboard, label: t('nav.myStats') }];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-card/95 backdrop-blur-lg">
        <div className="flex items-center justify-between h-full px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="font-semibold text-lg">{t('app.title')}</h1>
          <LanguageToggle />
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 z-50 h-full w-72 transition-transform duration-300 lg:translate-x-0",
          isRTL ? "right-0" : "left-0",
          sidebarOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full",
          "lg:block"
        )}
        style={{ background: 'var(--gradient-sidebar)' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <h1 className="text-xl font-bold text-sidebar-foreground">
              {t('app.title')}
            </h1>
            <p className="text-sm text-sidebar-foreground/60 mt-1">
              {t('app.subtitle')}
            </p>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 mx-4 mt-4 rounded-lg bg-sidebar-accent">
              <p className="font-medium text-sidebar-foreground">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60 mt-0.5">{user.email}</p>
              <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                {user.role === 'admin' ? t('auth.admin') : t('auth.supervisor')}
              </span>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive(item.href)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
                {isActive(item.href) && (
                  <ChevronRight className={cn("h-4 w-4 ms-auto", isRTL && "rotate-180")} />
                )}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center justify-between mb-4">
              <LanguageToggle />
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => {
                logout();
                navigat("/")
              }}
            >
              <LogOut className="h-5 w-5" />
              {t('nav.logout')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen pt-16 lg:pt-0 transition-all duration-300",
          isRTL ? "lg:mr-72" : "lg:ml-72"
        )}
      >
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};