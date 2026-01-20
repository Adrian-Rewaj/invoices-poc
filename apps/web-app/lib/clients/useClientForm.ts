import { useState, useEffect } from 'react';
import { Client, NewClient } from '../../types/client';

export function useClientForm(client?: Client) {
  const [form, setForm] = useState<NewClient>({
    name: '',
    email: '',
    nip: '',
  });

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name || '',
        email: client.email || '',
        nip: client.nip || '',
      });
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return { form, handleChange, setForm };
}
