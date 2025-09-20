
import { DuitStore } from '../types';
import { getToday } from '../utils/dateUtils';

export const requestPermission = async (): Promise<'granted' | 'denied' | 'default'> => {
  if (!('Notification' in window)) {
    alert("This browser does not support desktop notification");
    return 'denied';
  }
  
  const permission = await Notification.requestPermission();
  return permission;
};

export const scheduleDailyCheck = (store: DuitStore, nowProvider: () => Date) => {
  const check = () => {
    const now = nowProvider();
    const todayStr = getToday();
    const todayHasEntries = store.balances.history.some(h => h.date === todayStr && h.transactions.length > 0);
    const notifAlreadySent = store.lastDailyNotif === todayStr;

    if (now.getHours() >= 22 && !todayHasEntries && !notifAlreadySent) {
      new Notification("Belum ada catatan hari ini di 'duit'", {
        body: "Jangan lupa catat aktivitas tradingmu hari ini. Isi sekarang?",
        icon: '/favicon.ico', // You would place an icon in your public folder
      });
      // This part would require updating the store, which is tricky from a service.
      // A better architecture might involve a global state manager like Redux/Zustand,
      // but for this self-contained hook-based approach, we rely on the app component
      // to manage and persist the 'lastDailyNotif' state.
      console.log("Notification triggered for " + todayStr);
    }
    
    // Schedule next check for tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(22, 0, 0, 0);
    const msUntilTomorrow = tomorrow.getTime() - now.getTime();
    setTimeout(check, msUntilTomorrow);
  };

  const now = nowProvider();
  const nextCheck = new Date(now);
  nextCheck.setHours(22, 0, 5, 0); // Check at 22:00:05

  let msUntilNextCheck = nextCheck.getTime() - now.getTime();
  if (msUntilNextCheck < 0) {
    // It's past 10 PM, schedule for tomorrow
    nextCheck.setDate(nextCheck.getDate() + 1);
    msUntilNextCheck = nextCheck.getTime() - now.getTime();
  }

  setTimeout(check, msUntilNextCheck);
};
