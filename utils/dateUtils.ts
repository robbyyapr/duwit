
export const getToday = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const getISOWeek = (date: Date): string => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
  // Return array of year and week number
  const year = d.getUTCFullYear();
  return `${year}-${String(weekNo).padStart(2, '0')}`;
};

export const getISOWeekRange = (weekLabel: string): [string, string] => {
    const [year, week] = weekLabel.split('-').map(Number);
    const d = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 1 - day);
    const startDate = new Date(d);
    const endDate = new Date(d);
    endDate.setUTCDate(d.getUTCDate() + 6);
    return [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]];
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};
