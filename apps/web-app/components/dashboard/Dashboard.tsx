'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Client, ClientChangeLog, NewClient } from '../../types/client';
import { Invoice } from '../../types/invoice';
import Header from '../../components/dashboard/Header';
import StatsCard from '../../components/dashboard/StatsCard';
import ClientsList from '../../components/dashboard/ClientsList';
import { InvoicesList } from '../../components/dashboard/InvoicesList';
import { InvoiceItem } from '../../types/invoice-item';
import { InvoiceCreateModal } from '../../components/dashboard/InvoiceCreateModal';
import { ClientEditModal } from '../../components/dashboard/ClientEditModal';
import { InvoicePreviewModal } from '../../components/dashboard/InvoicePreviewModal';

export function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddClient, setShowAddClient] = useState<boolean>(false);
  const [newClient, setNewClient] = useState<NewClient>({ name: '', email: '', nip: '' });
  const [editClientId, setEditClientId] = useState<number | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState<NewClient>({ name: '', email: '', nip: '' });
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [editError, setEditError] = useState<string>('');
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [changeLogs, setChangeLogs] = useState<ClientChangeLog[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceCreateModal, setShowInvoiceCreateModal] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [editingClientId, setEditingClientId] = useState<number | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    fetchData();
  }, [status, router]);

  const fetchData = async () => {
    try {
      const [clientsRes, invoicesRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/invoices'),
      ]);

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData);
      }

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClient),
      });

      if (response.ok) {
        const newClientData = await response.json();
        setClients([newClientData, ...clients]);
        setNewClient({ name: '', email: '', nip: '' });
        setShowAddClient(false);
      } else if (response.status === 401) {
        router.push('/login');
      } else {
        const errorData = await response.json();
        console.error('Error adding client:', errorData.error);
      }
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const handleCreateInvoice = async (clientId: number) => {
    // Sample invoice items
    const sampleItems = [
      {
        name: 'Consulting Service',
        quantity: 1,
        unitPrice: 500.0,
        total: 500.0,
        description: 'IT consulting services',
      },
      {
        name: 'Subscription',
        quantity: 1,
        unitPrice: 50.0,
        total: 50.0,
        description: 'Monthly subscription',
      },
    ];

    setInvoiceItems(sampleItems);
    setEditingClientId(clientId);
    setShowInvoiceCreateModal(true);
  };

  const handleEditClick = async (client: Client) => {
    setEditClientId(client.id);
    setEditClient(client);
    setEditForm({ name: client.name, email: client.email, nip: client.nip });
    setShowEditClientModal(true);
    setEditError('');
    setEditLoading(false);

    // get changes history
    try {
      const res = await fetch(`/api/clients/${client.id}/history`);
      if (res.ok) {
        const logs = await res.json();
        setChangeLogs(logs);
      } else {
        setChangeLogs([]);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setChangeLogs([]);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    if (!editClientId) return;
    setEditLoading(true);
    setEditError('');
    try {
      const res = await fetch(`/api/clients/${editClientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setShowEditClientModal(false);
      } else if (res.status === 401) {
        router.push('/login');
      } else {
        const data = await res.json();
        setEditError(data.error || 'Edit error');
      }
    } catch (e) {
      setEditError('Network error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleLogout = () => {
    signOut({ redirect: false });
    router.push('/login');
  };

  const handleInvoicePreview = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        alert(`PDF download error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('PDF download error');
    }
  };

  const handleAddInvoiceItem = () => {
    const newItem = {
      name: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      description: '',
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const handleRemoveInvoiceItem = (index: number) => {
    const newItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(newItems);
  };

  const handleUpdateInvoiceItem = (index: number, field: string, value: string | number) => {
    const newItems = [...invoiceItems];
    newItems[index] = { ...newItems[index], [field]: value };

    // total price
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }

    setInvoiceItems(newItems);
  };

  const handleSaveInvoice = async () => {
    if (!editingClientId) return;

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: editingClientId,
          items: invoiceItems,
        }),
      });

      if (response.ok) {
        const newInvoice = await response.json();
        setInvoices([newInvoice, ...invoices]);
        setShowInvoiceCreateModal(false);
        setInvoiceItems([]);
        setEditingClientId(null);
      } else {
        const errorData = await response.json();
        console.error('Error creating invoice:', errorData.error);
        alert(`Invoice creation error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Invoice creation error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <Header />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <StatsCard clientsNumber={clients.length} invoicesNumber={invoices.length} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <ClientsList
            setShowAddClient={setShowAddClient}
            showAddClient={showAddClient}
            onAddClient={handleAddClient}
            newClient={newClient}
            setNewClient={setNewClient}
            clients={clients}
            onEditClick={handleEditClick}
            onCreateInvoice={handleCreateInvoice}
          />
          <InvoicesList
            invoices={invoices}
            onInvoicePreview={handleInvoicePreview}
            onDownloadPDF={handleDownloadPDF}
          />
        </div>
      </div>

      {/* create Invoice modal */}
      {showInvoiceCreateModal && (
        <InvoiceCreateModal
          setShowInvoiceEditModal={setShowInvoiceCreateModal}
          onAddInvoiceItem={handleAddInvoiceItem}
          invoiceItems={invoiceItems}
          onRemoveInvoiceItem={handleRemoveInvoiceItem}
          onUpdateInvoiceItem={handleUpdateInvoiceItem}
          onSaveInvoice={handleSaveInvoice}
        />
      )}

      {/* edit client modal */}
      {showEditClientModal && editClient && (
        <ClientEditModal
          setShowEditClientModal={setShowEditClientModal}
          editForm={editForm}
          onEditChange={handleEditChange}
          editError={editError}
          onEditSave={handleEditSave}
          editLoading={editLoading}
          changeLogs={changeLogs}
        />
      )}

      {/* invoice preview modal*/}
      {showInvoiceModal && selectedInvoice && (
        <InvoicePreviewModal
          setShowInvoiceModal={setShowInvoiceModal}
          selectedInvoice={selectedInvoice}
          handleDownloadPDF={handleDownloadPDF}
        />
      )}
    </>
  );
}
