'use client';

import { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  useEffect(() => {
    const stored = localStorage.getItem('admin-theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggle = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('admin-theme', isDark ? 'dark' : 'light');
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="p-2 rounded-xl border border-gold-200/30 bg-white dark:bg-zinc-800 dark:border-zinc-700 text-gray-600 dark:text-zinc-200 hover:bg-gold-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
      aria-label="Toggle dark mode"
    >
      <Sun className="w-4 h-4 hidden dark:block" />
      <Moon className="w-4 h-4 block dark:hidden" />
    </button>
  );
}
