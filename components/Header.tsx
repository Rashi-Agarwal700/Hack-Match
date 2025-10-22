
import React from 'react';
import { SunIcon, MoonIcon, UserCircleIcon, SparklesIcon, LogoutIcon } from './icons';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onLogout }) => {
  return (
    <header className="bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-lg sticky top-0 z-20 border-b border-border-light dark:border-border-dark">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <SparklesIcon className="w-6 h-6 text-primary dark:text-primary-dark" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-text-primary-dark">HackMatch</h1>
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark hidden sm:block">Find Your Team. Build Your Dream.</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-background-dark/5 dark:hover:bg-background/5 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
          </button>
           <button 
            onClick={onLogout} 
            className="p-2 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-background-dark/5 dark:hover:bg-background/5 transition-colors"
            aria-label="Logout"
          >
            <LogoutIcon className="w-6 h-6" />
          </button>
          <UserCircleIcon className="w-8 h-8 text-text-secondary dark:text-text-secondary-dark" />
        </div>
      </div>
    </header>
  );
};

export default Header;
