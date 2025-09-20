

import { useState, useEffect, useCallback } from 'react';
import { DuitStore, Transaction, BalanceHistory, DuitStore as DuitStoreType } from '../types';
import { getToday, getISOWeek, getISOWeekRange } from '../utils/dateUtils';

const STORE_KEY = 'duit.store.v1';

const getDefaultStore = (): DuitStore => ({
  settings: {
    theme: 'light',
    notifGranted: false,
    deductZakatFromBalance: false,
  },
  balances: {
    current: 0,
    history: [],
  },
  zakat: {
    weekly: [],
  },
  lastActivityAt: new Date().toISOString(),
  lastDailyNotif: '',
});

export const useDuitStore = () => {
  const [store, setStore] = useState<DuitStore>(getDefaultStore());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedStore = localStorage.getItem(STORE_KEY);
      if (savedStore) {
        const parsedStore = JSON.parse(savedStore);
        // Basic migration/defaulting for new settings
        if (!parsedStore.settings.hasOwnProperty('deductZakatFromBalance')) {
            parsedStore.settings.deductZakatFromBalance = false;
        }
        setStore(parsedStore);
      } else {
        setStore(getDefaultStore());
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setStore(getDefaultStore());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(store));
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [store, isLoading]);

  const updateStore = useCallback((updater: (currentStore: DuitStore) => DuitStore) => {
    setStore(prevStore => {
        let newStore = updater(prevStore);

        const todayStr = getToday();
        if (!newStore.balances.history.some(h => h.date === todayStr)) {
            const lastClosingBalance = newStore.balances.history[0]?.closingBalance || newStore.balances.current;
            newStore.balances.history.push({
                date: todayStr,
                openingBalance: lastClosingBalance,
                capitalUsed: 0,
                totalWithdraw: 0,
                profit: 0,
                zakatAccrued: 0,
                closingBalance: lastClosingBalance,
                transactions: [],
            });
        }
        
        newStore.balances.history = newStore.balances.history.filter(day => day.transactions.length > 0 || day.date === todayStr);

        newStore.balances.history.sort((a, b) => b.date.localeCompare(a.date));
        
        let lastDayClosingBalance = 0;
        const reversedHistory = [...newStore.balances.history].reverse();
        const recalculatedHistory = [];
        
        for (const day of reversedHistory) {
            day.openingBalance = lastDayClosingBalance;

            day.capitalUsed = day.transactions.reduce((sum, tx) => sum + tx.capitalUsed, 0);
            day.totalWithdraw = day.transactions.reduce((sum, tx) => sum + tx.withdraw, 0);
            day.profit = day.transactions.reduce((sum, tx) => sum + tx.profit, 0);
            day.zakatAccrued = day.transactions.reduce((sum, tx) => sum + tx.zakat, 0);
            
            day.closingBalance = day.openingBalance - day.capitalUsed + day.totalWithdraw;
            lastDayClosingBalance = day.closingBalance;
            recalculatedHistory.push(day);
        }

        newStore.balances.history = recalculatedHistory.reverse();
        newStore.balances.current = newStore.balances.history[0]?.closingBalance || 0;

        const allHistory = newStore.balances.history;
        const zakatMap = new Map<string, number>();
        allHistory.forEach(day => {
            const weekLabel = getISOWeek(new Date(day.date + 'T00:00:00'));
            const currentZakat = zakatMap.get(weekLabel) || 0;
            zakatMap.set(weekLabel, currentZakat + day.zakatAccrued);
        });
        
        const newWeeklyZakat = Array.from(zakatMap.entries()).map(([weekLabel, accrued]) => {
            const existing = newStore.zakat.weekly.find(w => w.weekLabel === weekLabel);
            const [start, end] = getISOWeekRange(weekLabel);
            return {
                ...existing,
                weekLabel,
                start,
                end,
                accrued,
                paid: existing?.paid || 0,
                paidAt: existing?.paidAt || null,
                ackByUser: existing?.ackByUser || false,
            };
        });

        newStore.zakat.weekly = newWeeklyZakat.sort((a,b) => b.weekLabel.localeCompare(a.weekLabel));
        
        newStore.lastActivityAt = new Date().toISOString();
        return {...newStore};
    });
  }, []);

  const addTransaction = useCallback((txData: Omit<Transaction, 'id' | 'profit' | 'zakat'>) => {
    updateStore(currentStore => {
      const { capitalUsed, withdraw } = txData;
      const profit = Math.max(0, withdraw - capitalUsed);
      const zakat = profit > 0 ? Math.floor(profit * 0.025) : 0;
      const newTx: Transaction = { ...txData, id: crypto.randomUUID(), profit, zakat };

      const dateStr = newTx.time.split('T')[0];
      const historyCopy = [...currentStore.balances.history];
      let dayHistory = historyCopy.find(h => h.date === dateStr);

      if (dayHistory) {
        dayHistory.transactions.push(newTx);
        dayHistory.transactions.sort((a, b) => a.time.localeCompare(b.time));
      } else {
        dayHistory = {
          date: dateStr,
          openingBalance: 0, closingBalance: 0, capitalUsed: 0, totalWithdraw: 0, profit: 0, zakatAccrued: 0,
          transactions: [newTx]
        };
        historyCopy.push(dayHistory);
      }
      return { ...currentStore, balances: { ...currentStore.balances, history: historyCopy }};
    });
  }, [updateStore]);
  
  const updateTransaction = useCallback((txData: Omit<Transaction, 'id' | 'profit' | 'zakat'>, originalId?: string) => {
    if (!originalId) return;
    updateStore(currentStore => {
        const historyCopy = JSON.parse(JSON.stringify(currentStore.balances.history));
        
        let oldTxFound = false;
        for (const day of historyCopy) {
            const txIndex = day.transactions.findIndex((tx: Transaction) => tx.id === originalId);
            if (txIndex > -1) {
                day.transactions.splice(txIndex, 1);
                oldTxFound = true;
                break;
            }
        }
        if (!oldTxFound) return currentStore; 

        const { capitalUsed, withdraw } = txData;
        const profit = Math.max(0, withdraw - capitalUsed);
        const zakat = profit > 0 ? Math.floor(profit * 0.025) : 0;
        const updatedTx: Transaction = { ...txData, id: originalId, profit, zakat };
        const newDateStr = updatedTx.time.split('T')[0];

        let newDayHistory = historyCopy.find((h: BalanceHistory) => h.date === newDateStr);
        if (newDayHistory) {
            newDayHistory.transactions.push(updatedTx);
            newDayHistory.transactions.sort((a: Transaction, b: Transaction) => a.time.localeCompare(b.time));
        } else {
            newDayHistory = {
                date: newDateStr,
                openingBalance: 0, closingBalance: 0, capitalUsed: 0, totalWithdraw: 0, profit: 0, zakatAccrued: 0,
                transactions: [updatedTx]
            };
            historyCopy.push(newDayHistory);
        }

        return { ...currentStore, balances: { ...currentStore.balances, history: historyCopy }};
    });
  }, [updateStore]);
  
  const acknowledgeZakatPayment = useCallback((weekLabel: string) => {
     updateStore(currentStore => {
         const weeklyCopy = [...currentStore.zakat.weekly];
         const week = weeklyCopy.find(w => w.weekLabel === weekLabel);
         if (!week || week.ackByUser) return currentStore;
         
         week.ackByUser = true;
         week.paid = week.accrued;
         week.paidAt = new Date().toISOString();
         
         const newStore = { ...currentStore, zakat: { ...currentStore.zakat, weekly: weeklyCopy }};

         if (currentStore.settings.deductZakatFromBalance && week.accrued > 0) {
            const todayStr = getToday();
            const historyCopy = [...newStore.balances.history];
            let todayHistory = historyCopy.find(h => h.date === todayStr);

            const zakatPaymentTx: Transaction = {
                id: crypto.randomUUID(),
                time: new Date().toISOString(),
                capitalUsed: week.accrued,
                withdraw: 0,
                profit: 0,
                zakat: 0,
                notes: `Pembayaran Zakat mgg. ${weekLabel}`,
                isSystem: true,
            };

            if (todayHistory) {
                todayHistory.transactions.push(zakatPaymentTx);
                todayHistory.transactions.sort((a,b) => a.time.localeCompare(b.time));
            } else {
                // This case is handled by main updateStore logic, but as a robust fallback:
                const lastClosingBalance = historyCopy[0]?.closingBalance || newStore.balances.current;
                todayHistory = {
                    date: todayStr, openingBalance: lastClosingBalance, capitalUsed: 0, totalWithdraw: 0, profit: 0, zakatAccrued: 0, closingBalance: lastClosingBalance, 
                    transactions: [zakatPaymentTx],
                };
                historyCopy.push(todayHistory);
            }
            newStore.balances.history = historyCopy;
         }

         return newStore;
     });
  }, [updateStore]);

   const adjustBalance = useCallback((newBalance: number) => {
    updateStore(currentStore => {
      const historyCopy = [...currentStore.balances.history];
      const todayStr = getToday();
      
      let todayHistory = historyCopy.find(h => h.date === todayStr);
      // Ensure today's history exists before calculating current balance
      if (!todayHistory) {
        const lastClosingBalance = historyCopy[0]?.closingBalance || currentStore.balances.current;
        todayHistory = {
            date: todayStr,
            openingBalance: lastClosingBalance, capitalUsed: 0, totalWithdraw: 0, profit: 0, zakatAccrued: 0, 
            closingBalance: lastClosingBalance, transactions: [],
        };
        historyCopy.unshift(todayHistory); // Add to the start as it will be sorted later
      }

      const currentBalance = todayHistory.openingBalance - todayHistory.transactions.reduce((sum, tx) => sum + tx.capitalUsed, 0) + todayHistory.transactions.reduce((sum, tx) => sum + tx.withdraw, 0);
      const adjustment = newBalance - currentBalance;

      if (adjustment === 0) return currentStore;

      const adjustmentTx: Transaction = {
        id: crypto.randomUUID(),
        time: new Date().toISOString(),
        capitalUsed: adjustment < 0 ? Math.abs(adjustment) : 0,
        withdraw: adjustment > 0 ? adjustment : 0,
        profit: 0,
        zakat: 0,
        notes: "Penyesuaian Saldo",
        isSystem: true,
      };
      
      todayHistory.transactions.push(adjustmentTx);
      todayHistory.transactions.sort((a, b) => a.time.localeCompare(b.time));

      return { ...currentStore, balances: { ...currentStore.balances, history: historyCopy } };
    });
  }, [updateStore]);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setStore(currentStore => ({
      ...currentStore,
      settings: { ...currentStore.settings, theme }
    }));
  }, []);

  const setSetting = useCallback(<K extends keyof DuitStoreType['settings']>(key: K, value: DuitStoreType['settings'][K]) => {
    setStore(currentStore => ({
      ...currentStore,
      settings: { ...currentStore.settings, [key]: value }
    }));
  }, []);

  return { store, addTransaction, updateTransaction, acknowledgeZakatPayment, setTheme, setSetting, adjustBalance, isLoading };
};