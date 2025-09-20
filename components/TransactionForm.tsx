import React, { useState, useEffect, useMemo } from 'react';
import Card from './Card';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/dateUtils';

interface TransactionFormProps {
  onClose: () => void;
  onSubmit: (transactionData: Omit<Transaction, 'id' | 'profit' | 'zakat'>, originalId?: string) => void;
  transaction: Transaction | null;
  currentCapital: number;
}

const toDateTimeLocalInput = (isoDate: string | Date): string => {
  const date = typeof isoDate === 'string' ? new Date(isoDate) : isoDate;
  // Trick to format to local time YYYY-MM-DDTHH:mm
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};


const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, onSubmit, transaction, currentCapital }) => {
  const [time, setTime] = useState(toDateTimeLocalInput(new Date()));
  const [capitalUsed, setCapitalUsed] = useState('0');
  const [withdraw, setWithdraw] = useState('0');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (transaction) {
      setTime(toDateTimeLocalInput(transaction.time));
      setCapitalUsed(String(transaction.capitalUsed));
      setWithdraw(String(transaction.withdraw));
      setNotes(transaction.notes || '');
    } else {
        // For new transactions, pre-fill capital if it's the first transaction of the day
        if (currentCapital > 0) {
            setCapitalUsed(String(currentCapital));
        }
    }
  }, [transaction, currentCapital]);

  const { profit, zakat } = useMemo(() => {
    const capital = parseFloat(capitalUsed) || 0;
    const wd = parseFloat(withdraw) || 0;
    const p = Math.max(0, wd - capital);
    const z = p > 0 ? Math.floor(p * 0.025) : 0;
    return { profit: p, zakat: z };
  }, [capitalUsed, withdraw]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      time: new Date(time).toISOString(), // Convert local datetime string back to UTC ISO string
      capitalUsed: parseFloat(capitalUsed) || 0,
      withdraw: parseFloat(withdraw) || 0,
      notes,
    }, transaction?.id);
    onClose();
  };
  
  const handleUseCurrentCapital = () => {
    setCapitalUsed(String(currentCapital));
  };

  const inputClass = "w-full p-3 rounded-lg bg-transparent shadow-neumorphic-inset dark:shadow-dark-neumorphic-inset focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent";

  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md" as="form" onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{transaction ? 'Ubah Transaksi' : 'Tambah Transaksi'}</h2>
          <button type="button" onClick={onClose} className="text-2xl">&times;</button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Waktu</label>
            <input type="datetime-local" value={time} onChange={e => setTime(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium">Modal Digunakan</label>
            <div className="relative">
                <input type="number" value={capitalUsed} onChange={e => setCapitalUsed(e.target.value)} placeholder="0" className={inputClass} />
                {currentCapital > 0 && capitalUsed !== String(currentCapital) && !transaction && (
                    <button type="button" onClick={handleUseCurrentCapital} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-light-accent text-white px-2 py-1 rounded">Use Daily Capital</button>
                )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Withdraw</label>
            <input type="number" value={withdraw} onChange={e => setWithdraw(e.target.value)} placeholder="0" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium">Catatan (Opsional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} rows={2}></textarea>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg shadow-neumorphic-inset dark:shadow-dark-neumorphic-inset text-center">
            <p className="text-sm">Estimasi Profit: <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(profit)}</span></p>
            <p className="text-sm">Estimasi Zakat: <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(zakat)}</span></p>
        </div>

        <div className="mt-6">
          <button type="submit" className="w-full py-3 font-semibold rounded-lg bg-light-accent text-white dark:bg-dark-accent dark:text-dark-bg shadow-neumorphic-outset dark:shadow-dark-neumorphic-outset active:shadow-neumorphic-inset active:dark:shadow-dark-neumorphic-inset transition-all">
            Simpan
          </button>
        </div>
      </Card>
    </div>
  );
};

export default TransactionForm;