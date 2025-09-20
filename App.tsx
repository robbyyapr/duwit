
import React, { useState, useEffect, useCallback } from 'react';
import { useDuitStore } from './hooks/useDuitStore';
import { useIdleLocker } from './hooks/useIdleLocker';
import { requestPermission, scheduleDailyCheck } from './services/notificationService';
import LockScreen from './components/LockScreen';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import History from './components/History';
import TransactionForm from './components/TransactionForm';
import { Transaction } from './types';
import { formatCurrency } from './utils/dateUtils';

const App: React.FC = () => {
  const [isLocked, setIsLocked] = useState(true);
  const { store, addTransaction, updateTransaction, acknowledgeZakatPayment, setTheme, setSetting, adjustBalance, isLoading } = useDuitStore();
  const [activeView, setActiveView] = useState<'dashboard' | 'history'>('dashboard');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>('default');

  const handleUnlock = () => setIsLocked(false);
  const handleLock = useCallback(() => setIsLocked(true), []);
  
  useIdleLocker(handleLock, 60000); // Lock time is set to 1 minute (60000ms).

  useEffect(() => {
    if (store.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [store.settings.theme]);

  const handleRequestNotification = async () => {
    const permission = await requestPermission();
    setNotificationStatus(permission);
    if (permission === 'granted') {
      scheduleDailyCheck(store, () => new Date());
    }
  };

  useEffect(() => {
    if (store && !isLoading) {
      if (store.settings.notifGranted) {
        setNotificationStatus('granted');
        scheduleDailyCheck(store, () => new Date());
      } else if (Notification.permission !== 'default') {
        setNotificationStatus(Notification.permission);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, store]);

  const handleOpenTransactionForm = (transaction: Transaction | null = null) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };
  
  const handleCloseTransactionForm = () => {
    setEditingTransaction(null);
    setShowTransactionForm(false);
  };

  const handleAdjustBalance = () => {
    const currentFormatted = formatCurrency(store.balances.current);
    const newBalanceStr = window.prompt(`Sesuaikan Saldo Saat Ini.\nSaldo sekarang: ${currentFormatted}\n\nMasukkan jumlah saldo yang benar:`, store.balances.current.toString());

    if (newBalanceStr) {
      const newBalance = parseFloat(newBalanceStr.replace(/[^0-9]/g, ''));
      if (!isNaN(newBalance) && newBalance >= 0) {
        adjustBalance(newBalance);
      } else {
        alert("Input tidak valid. Harap masukkan angka saja.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-light-primary dark:text-dark-primary">
        Loading...
      </div>
    );
  }

  if (isLocked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <div className="min-h-screen text-light-primary dark:text-dark-primary p-4 sm:p-6 lg:p-8 font-sans flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col">
        <Header 
          currentBalance={store.balances.current}
          theme={store.settings.theme}
          onToggleTheme={setTheme}
          onAddTransaction={() => handleOpenTransactionForm()}
          onAdjustBalance={handleAdjustBalance}
        />

        {notificationStatus === 'default' && (
          <div className="p-4 mb-6 text-sm text-center text-dark-bg bg-yellow-300 rounded-lg shadow-neumorphic-outset dark:shadow-dark-neumorphic-outset">
            Enable notifications to get daily reminders! 
            <button onClick={handleRequestNotification} className="ml-2 font-bold underline">Allow</button>
          </div>
        )}

        <main className="flex-grow">
          <nav className="flex justify-center mb-6">
            <div className="inline-flex rounded-lg shadow-neumorphic-inset dark:shadow-dark-neumorphic-inset p-1">
              <button 
                onClick={() => setActiveView('dashboard')}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeView === 'dashboard' ? 'shadow-neumorphic-outset dark:shadow-dark-neumorphic-outset' : 'text-gray-500'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveView('history')}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeView === 'history' ? 'shadow-neumorphic-outset dark:shadow-dark-neumorphic-outset' : 'text-gray-500'}`}
              >
                History
              </button>
            </div>
          </nav>

          {activeView === 'dashboard' && store && (
            <Dashboard 
              store={store} 
              onAcknowledgeZakat={acknowledgeZakatPayment}
              onEditTransaction={(tx) => handleOpenTransactionForm(tx)}
              theme={store.settings.theme}
              settings={store.settings}
              onSetSetting={setSetting}
            />
          )}

          {activeView === 'history' && store && (
            <History 
              history={store.balances.history}
              onEditTransaction={(tx) => handleOpenTransactionForm(tx)}
            />
          )}
        </main>
        
        {showTransactionForm && (
          <TransactionForm 
            onClose={handleCloseTransactionForm}
            onSubmit={editingTransaction ? updateTransaction : addTransaction}
            transaction={editingTransaction}
            currentCapital={store.balances.history[0]?.capitalUsed || 0}
          />
        )}
        
        <footer className="text-center text-xs text-gray-400 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700/50">
          <p>duit - Personal Trading & Zakat Tracker</p>
          <p>Notification Status: <span className="font-semibold">{notificationStatus}</span></p>
        </footer>
      </div>
    </div>
  );
};

export default App;
