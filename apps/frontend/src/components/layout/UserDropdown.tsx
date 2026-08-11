import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

export const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) {
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const estimatedWidth = 240;
    const rightPadding = 16;
    const left = Math.min(
      window.innerWidth - estimatedWidth - rightPadding,
      Math.max(12, triggerRect.right - estimatedWidth)
    );

    setMenuStyle({
      position: 'fixed',
      top: triggerRect.bottom + 14,
      left,
      width: estimatedWidth,
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleViewportChange = () => {
      if (!triggerRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const estimatedWidth = menuRef.current?.getBoundingClientRect().width || 240;
      const rightPadding = 16;
      const left = Math.min(
        window.innerWidth - estimatedWidth - rightPadding,
        Math.max(12, triggerRect.right - estimatedWidth)
      );

      setMenuStyle({
        position: 'fixed',
        top: triggerRect.bottom + 14,
        left,
        width: estimatedWidth,
      });
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen]);

  return (
    <div className="relative flex-shrink-0" ref={dropdownRef}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-md p-2 transition-colors hover:bg-muted"
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="text-sm text-left hidden md:block">
          <div className="font-medium">{user?.name || 'User'}</div>
          <div className="text-muted-foreground text-xs">{user?.email || 'user@example.com'}</div>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "transform rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={menuStyle}
            className="z-50 overflow-hidden rounded-2xl border border-border bg-card py-1 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-black/5 backdrop-blur-xl"
          >
            <div className="px-4 pb-3 pt-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Account</div>
              <div className="mt-2 font-medium text-foreground">{user?.name || 'User'}</div>
              <div className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</div>
            </div>

            <div className="mx-3 mb-2 h-px bg-border" />


            <button
              onClick={() => { setIsOpen(false); navigate('/profile'); }}
              className="flex w-full items-center px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted/80"
            >
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </button>
            <button
              onClick={() => { setIsOpen(false); navigate('/settings'); }}
              className="flex w-full items-center px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted/80"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </button>
            <div className="my-1 border-t border-border"></div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-3 text-sm text-red-500 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
