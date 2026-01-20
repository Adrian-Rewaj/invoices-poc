import { useState } from 'react';
import { NewClient, Client } from '../../types/client';

interface Props {
  onClientAdded?: (client: Client) => void;
}

export function useAddClient({ onClientAdded }: Props = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const addClient = async (data: NewClient) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Error adding client');
      } else {
        const client: Client = await res.json();
        onClientAdded?.(client);
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return { addClient, loading, error };
}
