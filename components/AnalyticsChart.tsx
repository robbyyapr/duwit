import React, { useEffect, useRef } from 'react';
import { BalanceHistory } from '../types';
import Card from './Card';
import { formatCurrency } from '../utils/dateUtils';

declare var Chart: any;

interface AnalyticsChartProps {
  history: BalanceHistory[];
  theme: 'light' | 'dark';
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ history, theme }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current || typeof Chart === 'undefined') return;
    
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    if (history.length < 2) return;

    const sortedHistory = [...history].slice(0, 30).reverse();
    const labels = sortedHistory.map(h => new Date(h.date + 'T00:00:00').toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }));
    const balanceData = sortedHistory.map(h => h.closingBalance);
    const profitLossData = sortedHistory.map(h => h.totalWithdraw - h.capitalUsed);

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
      
    const isDarkMode = theme === 'dark';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const fontColor = isDarkMode ? '#E2E8F0' : '#4A5568';
    const accentColor = isDarkMode ? '#63B3ED' : '#3182CE';
    const accentColorTransparent = isDarkMode ? 'rgba(99, 179, 237, 0.2)' : 'rgba(49, 130, 206, 0.2)';
    const successColor = isDarkMode ? 'rgba(72, 187, 120, 0.7)' : 'rgba(56, 161, 105, 0.7)';
    const dangerColor = isDarkMode ? 'rgba(245, 101, 101, 0.7)' : 'rgba(229, 62, 62, 0.7)';

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            type: 'line',
            label: 'Saldo Akhir',
            data: balanceData,
            borderColor: accentColor,
            backgroundColor: accentColorTransparent,
            yAxisID: 'yBalance',
            tension: 0.1,
            fill: true,
          },
          {
            type: 'bar',
            label: 'Profit/Loss Harian',
            data: profitLossData,
            backgroundColor: profitLossData.map(p => p >= 0 ? successColor : dangerColor),
            yAxisID: 'yProfitLoss',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
          x: {
            ticks: { color: fontColor },
            grid: { color: gridColor },
          },
          yBalance: {
            type: 'linear',
            position: 'left',
            ticks: { 
                color: fontColor,
                callback: (value: any) => new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(Number(value))
            },
            grid: { color: gridColor },
            title: { display: true, text: 'Saldo', color: fontColor },
          },
          yProfitLoss: {
            type: 'linear',
            position: 'right',
            ticks: { 
                color: fontColor,
                callback: (value: any) => new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(Number(value))
            },
            grid: { drawOnChartArea: false },
            title: { display: true, text: 'Profit/Loss', color: fontColor },
          },
        },
        plugins: {
            legend: { labels: { color: fontColor } },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += formatCurrency(context.parsed.y);
                        }
                        return label;
                    }
                }
            },
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x',
                    modifierKey: 'ctrl',
                },
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true,
                    },
                    mode: 'x',
                },
            },
        }
      },
    });
    
  }, [history, theme]);

  if (history.length < 2) {
      return (
          <Card>
              <h2 className="text-lg font-bold mb-4">Pergerakan Saldo & Profit</h2>
              <div className="flex items-center justify-center h-64">
                <p className="text-center text-gray-500 dark:text-gray-400">Data tidak cukup untuk menampilkan grafik.<br/>Minimal 2 hari catatan dibutuhkan.</p>
              </div>
          </Card>
      );
  }

  return (
    <Card>
      <h2 className="text-lg font-bold mb-4">Pergerakan Saldo & Profit</h2>
      <div className="relative h-64 sm:h-80">
        <canvas ref={chartRef}></canvas>
      </div>
      <p className="text-xs text-center text-gray-400 mt-2">
        Gunakan scroll untuk zoom. Tahan 'Ctrl' + drag untuk menggeser.
      </p>
    </Card>
  );
};

export default AnalyticsChart;