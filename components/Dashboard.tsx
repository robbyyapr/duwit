
import React from 'react';
import Card from './Card';
import Accordion from './Accordion';
import AnalyticsChart from './AnalyticsChart';
import ToggleSwitch from './ToggleSwitch';
import { DuitStore, Transaction } from '../types';
import { getToday, getISOWeek, formatCurrency } from '../utils/dateUtils';

interface DashboardProps {
  store: DuitStore;
  onAcknowledgeZakat: (weekLabel: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
  theme: 'light' | 'dark';
  settings: DuitStore['settings'];
  onSetSetting: <K extends keyof DuitStore['settings']>(key: K, value: DuitStore['settings'][K]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ store, onAcknowledgeZakat, onEditTransaction, theme, settings, onSetSetting }) => {
  const todayStr = getToday();
  const todayData = store.balances.history.find(h => h.date === todayStr);
  
  const currentWeekLabel = getISOWeek(new Date());
  const currentWeekZakat = store.zakat.weekly.find(w => w.weekLabel === currentWeekLabel);

  const handleAcknowledge = (weekLabel: string) => {
    if (window.confirm(`Anda yakin ingin menandai Zakat untuk minggu ${weekLabel} sebagai LUNAS? Tindakan ini akan dicatat.`)) {
      onAcknowledgeZakat(weekLabel);
    }
  };

  const ZakatInfo = currentWeekZakat && currentWeekZakat.accrued > 0 ? (
     <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Akrual</p>
          <p className="font-bold text-2xl text-blue-600 dark:text-blue-400">{formatCurrency(currentWeekZakat.accrued)}</p>
        </div>
        {currentWeekZakat.ackByUser ? (
          <div className="text-center px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 shadow-neumorphic-inset dark:shadow-dark-neumorphic-inset">
            <p className="font-semibold">Sudah Dibayar</p>
            <p className="text-xs">{new Date(currentWeekZakat.paidAt!).toLocaleString()}</p>
          </div>
        ) : (
          <button 
            onClick={() => handleAcknowledge(currentWeekZakat.weekLabel)}
            className="px-6 py-3 font-semibold rounded-lg bg-light-accent text-white dark:bg-dark-accent dark:text-dark-bg shadow-neumorphic-outset dark:shadow-dark-neumorphic-outset active:shadow-neumorphic-inset active:dark:shadow-dark-neumorphic-inset transition-all"
          >
            Tandai Sudah Bayar
          </button>
        )}
      </div>
  ) : null;


  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
      {/* Left Column */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <AnalyticsChart history={store.balances.history} theme={theme} />
        <Accordion title="Transaksi Hari Ini" startOpen={true}>
           {todayData && todayData.transactions.length > 0 ? (
              <ul className="space-y-3">
                {todayData.transactions.map(tx => (
                  <li key={tx.id} className="flex justify-between items-start p-3 rounded-lg shadow-neumorphic-inset dark:shadow-dark-neumorphic-inset">
                    <div>
                      <p className="font-semibold">{new Date(tx.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                      {tx.isSystem ? (
                        <div className="mt-1 pl-2 border-l-2 border-gray-300 dark:border-gray-600">
                           <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{tx.notes}</p>
                           <p className="text-sm text-red-600 dark:text-red-400">Pengeluaran: {formatCurrency(tx.capitalUsed)}</p>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm">Modal: {formatCurrency(tx.capitalUsed)} &rarr; Withdraw: {formatCurrency(tx.withdraw)}</p>
                          {tx.profit > 0 && <p className="text-sm text-green-600 dark:text-green-400">Profit: {formatCurrency(tx.profit)} (Zakat: {formatCurrency(tx.zakat)})</p>}
                        </>
                      )}
                    </div>
                    {!tx.isSystem && 
                      <button onClick={() => onEditTransaction(tx)} className="text-xs text-blue-500 hover:underline flex-shrink-0 ml-2">
                        Edit
                      </button>
                    }
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">Belum ada transaksi hari ini.</p>
            )}
        </Accordion>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <h2 className="text-lg font-bold mb-4">Ringkasan Hari Ini</h2>
          {todayData ? (
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Modal</p>
                <p className="font-bold text-lg">{formatCurrency(todayData.capitalUsed)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Withdraw</p>
                <p className="font-bold text-lg">{formatCurrency(todayData.totalWithdraw)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Profit</p>
                <p className="font-bold text-lg text-green-600 dark:text-green-400">{formatCurrency(todayData.profit)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Akrual Zakat</p>
                <p className="font-bold text-lg text-blue-600 dark:text-blue-400">{formatCurrency(todayData.zakatAccrued)}</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">Belum ada catatan untuk hari ini.</p>
          )}
        </Card>

        {ZakatInfo && (
            <Accordion title="Zakat Minggu Ini" startOpen={!currentWeekZakat?.ackByUser}>
                {ZakatInfo}
            </Accordion>
        )}

        <Accordion title="Pengaturan">
          <ToggleSwitch
              id="deduct-zakat-toggle"
              label="Otomatis Kurangi Saldo Saat Bayar Zakat"
              checked={settings.deductZakatFromBalance}
              onChange={(isChecked) => onSetSetting('deductZakatFromBalance', isChecked)}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Jika aktif, membayar zakat akan membuat transaksi pengeluaran baru (modal keluar) sejumlah zakat yang dibayar.
          </p>
        </Accordion>
      </div>
    </div>
  );
};

export default Dashboard;
