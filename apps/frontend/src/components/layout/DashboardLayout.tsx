import { Outlet, NavLink } from 'react-router-dom';
import { useThemeStore } from '../../store/useThemeStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Moon, Sun, LayoutDashboard, Settings, Users, BarChart3, Menu, X, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { UserDropdown } from './UserDropdown';
import { cn } from '../../utils/cn';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardLayout = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const adminNavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/leads', icon: Users, label: 'Leads' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/team', icon: Users, label: 'Team' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const salesNavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/leads', icon: Users, label: 'My Leads' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const navItems = user?.role === 'ADMIN' ? adminNavItems : salesNavItems;

  return (
    <div className="min-h-screen bg-background flex transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card/95 backdrop-blur-xl p-4 flex flex-col transform transition-transform duration-200 ease-in-out md:relative md:transform-none border-l-4 border-l-primary",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-orange-500">
            GigFlow CRM
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)} className="md:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">© 2026 GigFlow</span>
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="min-h-16 border-b border-border flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6 bg-card shrink-0">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(true)} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Search Bar (Desktop) */}
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 ml-auto">
            <UserDropdown />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
