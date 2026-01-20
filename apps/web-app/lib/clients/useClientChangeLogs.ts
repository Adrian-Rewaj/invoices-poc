import { useEffect, useState } from 'react';
import { ClientChangeLog } from '../../types/client';

export function useClientChangeLogs(clientId?: number) {
  const [logs, setLogs] = useState<ClientChangeLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientId) return;

    setLoading(true);
    fetch(`/api/clients/${clientId}/history`)
      .then((r) => r.json())
      .then(setLogs)
      .finally(() => setLoading(false));
  }, [clientId]);

  return { logs, loading };
}
