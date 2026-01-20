import { useEffect, useState } from 'react';
import { Client } from '../../types/client';

export function useClientsQuery() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/clients');
        if (!res.ok) throw new Error();
        setClients(await res.json());
      } catch {
        setError('Failed to load clients');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  return { clients, setClients, isLoading, error };
}
