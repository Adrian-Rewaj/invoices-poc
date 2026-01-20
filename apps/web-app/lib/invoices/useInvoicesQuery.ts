import { useState, useEffect } from 'react';
import { Invoice } from '../../types/invoice';

export function useInvoicesQuery() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch('/api/invoices');
        if (!res.ok) throw new Error('Failed to load invoices');
        const data = await res.json();
        setInvoices(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load invoices');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  return { invoices, setInvoices, isLoading, error };
}
