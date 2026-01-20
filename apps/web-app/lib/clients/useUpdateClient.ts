import { useState } from 'react';
import { NewClient, Client } from '../../types/client';

interface Props {
  onClientUpdated?: (client: Client) => void;
}

export function useUpdateClient({ onClientUpdated }: Props = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const updateClient = async (id: number, data: NewClient) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Error updating client');
      } else {
        const client: Client = await res.json();
        onClientUpdated?.(client);
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return { updateClient, loading, error };
}
