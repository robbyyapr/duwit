
export interface Transaction {
  id: string;
  time: string; // ISO Datetime string
  capitalUsed: number;
  withdraw: number;
  profit: number;
  zakat: number;
  notes?: string;
  isSystem?: boolean;
}

export interface BalanceHistory {
  date: string; // YYYY-MM-DD
  openingBalance: number;
  capitalUsed: number;
  totalWithdraw: number;
  profit: number;
  zakatAccrued: number;
  closingBalance: number;
  transactions: Transaction[];
  notes?: string;
}

export interface ZakatWeek {
  weekLabel: string; // YYYY-WW
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  accrued: number;
  paid: number;
  paidAt: string | null; // ISO-8601
  ackByUser: boolean;
}

export interface DuitStore {
  settings: {
    theme: 'light' | 'dark';
    notifGranted: boolean;
    deductZakatFromBalance: boolean;
  };
  balances: {
    current: number;
    history: BalanceHistory[];
  };
  zakat: {
    weekly: ZakatWeek[];
  };
  lastActivityAt: string; // ISO-8601
  lastDailyNotif: string; // YYYY-MM-DD
}
