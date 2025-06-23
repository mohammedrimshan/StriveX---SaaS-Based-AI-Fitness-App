export const parseISO = (dateString: string): Date => {
  return new Date(dateString);
};

export const format = (date: Date, formatStr: string): string => {
  
  if (formatStr === 'dd MMM yyyy, hh:mm a') {
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } else if (formatStr === 'MMMM') {
    return date.toLocaleString('en-US', { month: 'long' });
  } else if (formatStr === 'yyyy-MM-dd') {
    return date.toISOString().split('T')[0];
  }
  
  return date.toLocaleDateString();
};

export const isWithinInterval = (date: Date, interval: { start: Date; end: Date }): boolean => {
  return date >= interval.start && date <= interval.end;
};

export const startOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const endOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};


export const formatDateTime = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'dd MMM yyyy, hh:mm a');
};
