
import React, { useState } from 'react';
import { BalanceHistory, Transaction } from '../types';
import Card from './Card';
import { formatCurrency } from '../utils/dateUtils';

interface HistoryProps {
    history: BalanceHistory[];
    onEditTransaction: (transaction: Transaction) => void;
}

const History: React.FC<HistoryProps> = ({ history, onEditTransaction }) => {
    const [expandedDate, setExpandedDate] = useState<string | null>(null);

    const toggleExpand = (date: string) => {
        setExpandedDate(expandedDate === date ? null : date);
    };

    if (history.length === 0) {
        return <Card><p className="text-center text-gray-500">No history yet.</p></Card>;
    }

    return (
        <div className="space-y-4">
            {history.map(day => (
                <Card key={day.date}>
                    <div className="cursor-pointer" onClick={() => toggleExpand(day.date)}>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-bold text-lg">{new Date(day.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p className="text-sm text-green-600 dark:text-green-400">Profit: {formatCurrency(day.profit)}</p>
                            </div>
                            <div className="text-right">
                               <p className="font-semibold">{formatCurrency(day.closingBalance)}</p>
                               <p className="text-xs text-gray-500">Closing Balance</p>
                            </div>
                        </div>
                    </div>
                    {expandedDate === day.date && (
                         <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                             <h3 className="font-semibold mb-2">Transactions:</h3>
                              {day.transactions.length > 0 ? (
                                <ul className="space-y-2">
                                    {day.transactions.map(tx => (
                                        <li key={tx.id} className="flex justify-between items-start p-2 rounded-lg shadow-neumorphic-inset dark:shadow-dark-neumorphic-inset">
                                            <div>
                                                <p className="font-bold text-sm">{new Date(tx.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                                                {tx.isSystem ? (
                                                    <div className="mt-1 pl-2 border-l-2 border-gray-300 dark:border-gray-600">
                                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{tx.notes}</p>
                                                        <p className="text-xs text-red-600 dark:text-red-400">Pengeluaran: {formatCurrency(tx.capitalUsed)}</p>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs">
                                                        <p>W: {formatCurrency(tx.withdraw)} / C: {formatCurrency(tx.capitalUsed)}</p>
                                                        {tx.profit > 0 && <p className="text-green-500 dark:text-green-400">P: {formatCurrency(tx.profit)}, Z: {formatCurrency(tx.zakat)}</p>}
                                                    </div>
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
                               ) : <p className="text-xs text-gray-500">No transactions recorded.</p>}
                         </div>
                    )}
                </Card>
            ))}
        </div>
    );
};

export default History;
