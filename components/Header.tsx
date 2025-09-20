
import React from 'react';
import ThemeToggle from './ThemeToggle';
import { formatCurrency } from '../utils/dateUtils';

interface HeaderProps {
  currentBalance: number;
  theme: 'light' | 'dark';
  onToggleTheme: (theme: 'light' | 'dark') => void;
  onAddTransaction: () => void;
  onAdjustBalance: () => void;
}

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ currentBalance, theme, onToggleTheme, onAddTransaction, onAdjustBalance }) => {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">duit</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Saat Ini</p>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold text-light-accent dark:text-dark-accent">{formatCurrency(currentBalance)}</p>
          <button 
            onClick={onAdjustBalance}
            className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Sesuaikan Saldo"
          >
            <PencilIcon />
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <button
          onClick={onAddTransaction}
          className="p-3 rounded-full bg-light-bg dark:bg-dark-bg shadow-neumorphic-outset dark:shadow-dark-neumorphic-outset active:shadow-neumorphic-inset active:dark:shadow-dark-neumorphic-inset transition-all"
          aria-label="Tambah Transaksi"
        >
         <PlusIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;
