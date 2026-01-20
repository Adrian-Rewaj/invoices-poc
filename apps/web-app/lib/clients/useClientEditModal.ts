import { useState } from 'react';
import { Client } from '../../types/client';

export function useClientEditModal() {
  const [client, setClient] = useState<Client | null>(null);

  return {
    client,
    isOpen: !!client,
    open: (c: Client) => setClient(c),
    close: () => setClient(null),
  };
}
