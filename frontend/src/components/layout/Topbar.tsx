'use client';

import React from 'react';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';

export const Topbar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { collapsed } = useSidebar();

  return (
    <header
      className={`fixed top-0 right-0 h-16 z-50 flex items-center justify-between px-8 bg-background border-b border-border-glow shadow-sm transition-[left] duration-200 ease ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div className="flex items-center gap-4 bg-background px-4 py-2 rounded-xl w-96 max-w-full border border-border-glow shadow-sm">
        <Search size={18} className="text-foreground/40" />
        <input 
          type="text" 
          placeholder="Search something..." 
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-foreground/40 font-medium"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-foreground/5 transition-colors text-foreground/60"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button className="p-2 rounded-full hover:bg-foreground/5 transition-colors text-foreground/60 relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand-primary rounded-full border-2 border-background" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border-glow">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{user?.name || 'User'}</p>
            <p className="text-xs text-foreground/40">{user?.email || 'user@example.com'}</p>
          </div>
          <div className="w-9 h-9 bg-brand-accent/20 rounded-full flex items-center justify-center overflow-hidden border border-brand-accent/30">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-brand-primary font-bold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
