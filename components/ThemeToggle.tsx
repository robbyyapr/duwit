
import React from 'react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: (theme: 'light' | 'dark') => void;
}

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  const isDark = theme === 'dark';

  const handleToggle = () => {
    onToggle(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={handleToggle}
      className="relative w-16 h-8 flex items-center rounded-full p-1 shadow-neumorphic-inset dark:shadow-dark-neumorphic-inset transition-colors duration-300"
      aria-label="Toggle theme"
    >
      <div className={`absolute left-1 transition-transform duration-300 ${isDark ? 'translate-x-8' : 'translate-x-0'}`}>
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-light-bg dark:bg-dark-bg shadow-neumorphic-outset dark:shadow-dark-neumorphic-outset">
          {isDark ? <MoonIcon/> : <SunIcon/>}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
