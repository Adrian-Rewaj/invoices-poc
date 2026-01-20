import { useState } from 'react';
import { InvoiceItem } from '../../types/invoice-item';

interface UseInvoiceCreateProps {
  onInvoiceCreated?: (invoice: any) => void;
}

export function useInvoiceCreate({ onInvoiceCreated }: UseInvoiceCreateProps = {}) {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [editingClientId, setEditingClientId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const startCreating = (clientId: number) => {
    setEditingClientId(clientId);
    setInvoiceItems([]);
    setError('');
    setShowModal(true);
  };

  const addItem = () => {
    setInvoiceItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
        description: '',
      },
    ]);
  };

  const removeItem = (id: string) => {
    setInvoiceItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: string, value: string | number) => {
    setInvoiceItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const updated = { ...i, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = (Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0);
        }
        return updated;
      }),
    );
  };

  const saveInvoice = async () => {
    if (!editingClientId) return;
    if (invoiceItems.length === 0) {
      setError('Invoice must have at least one item');
      return;
    }
    setIsSaving(true);
    setError('');

    try {
      const itemsToSend = invoiceItems.map(({ id, ...rest }) => rest);
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: editingClientId, items: itemsToSend }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Invoice creation error');
      }
      const newInvoice = await res.json();
      onInvoiceCreated?.(newInvoice);
      setShowModal(false);
      setInvoiceItems([]);
      setEditingClientId(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invoice creation error');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    invoiceItems,
    showModal,
    isSaving,
    error,
    startCreating,
    addItem,
    removeItem,
    updateItem,
    saveInvoice,
    setShowModal,
  };
}
