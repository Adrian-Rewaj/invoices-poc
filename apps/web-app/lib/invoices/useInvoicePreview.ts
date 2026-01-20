import { useState } from 'react';
import { Invoice } from '../../types/invoice';

export function useInvoicePreview() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string>('');

  const openPreview = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
    setError('');
  };

  const downloadPDF = async (invoice: Invoice) => {
    setIsDownloading(true);
    setError('');
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/pdf`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'PDF download error');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'PDF download error');
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    selectedInvoice,
    showModal,
    isDownloading,
    error,
    openPreview,
    downloadPDF,
    setShowModal,
  };
}
