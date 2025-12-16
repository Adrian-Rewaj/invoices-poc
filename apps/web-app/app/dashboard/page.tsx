'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

interface Client {
  id: number;
  name: string;
  email: string;
  nip: string;
  createdAt: string;
}

interface Invoice {
  id: number;
  clientId: number;
  userId: number;
  issueDate: string;
  dueDate: string;
  invoiceNumber: string;
  data: any;
  pdfFileName?: string;
  status: string;
  client: Client;
  user: {
    id: number;
    username: string;
  };
}

interface ClientChangeLog {
  id: number;
  clientId: number;
  userId: number;
  field: string;
  before: any;
  after: any;
  changedAt: string;
  user: { username: string };
}

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', nip: '' });
  const [editClientId, setEditClientId] = useState<number | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', nip: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [changeLogs, setChangeLogs] = useState<ClientChangeLog[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceEditModal, setShowInvoiceEditModal] = useState(false);
  const [editingInvoiceItems, setEditingInvoiceItems] = useState<any[]>([]);
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

    setEditingInvoiceItems(sampleItems);
    setEditingClientId(clientId);
    setShowInvoiceEditModal(true);
  };

  const handleEditClick = async (client: Client) => {
    setEditClientId(client.id);
    setEditClient(client);
    setEditForm({ name: client.name, email: client.email, nip: client.nip });
    setShowEditModal(true);
    setEditError('');
    setEditLoading(false);

    // Pobierz historię zmian
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
        setShowEditModal(false);
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
        a.download = `faktura-${invoice.invoiceNumber}.pdf`;
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
    setEditingInvoiceItems([...editingInvoiceItems, newItem]);
  };

  const handleRemoveInvoiceItem = (index: number) => {
    const newItems = editingInvoiceItems.filter((_, i) => i !== index);
    setEditingInvoiceItems(newItems);
  };

  const handleUpdateInvoiceItem = (index: number, field: string, value: any) => {
    const newItems = [...editingInvoiceItems];
    newItems[index] = { ...newItems[index], [field]: value };

    // Oblicz total dla pozycji
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }

    setEditingInvoiceItems(newItems);
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
          items: editingInvoiceItems,
        }),
      });

      if (response.ok) {
        const newInvoice = await response.json();
        setInvoices([newInvoice, ...invoices]);
        setShowInvoiceEditModal(false);
        setEditingInvoiceItems([]);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-7 w-7 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Invoice System</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Welcome, dev!
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Clients</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{clients.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Invoices</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{invoices.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">0 zł</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Clients Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Clients
                </h3>
                <button
                  onClick={() => setShowAddClient(!showAddClient)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Client
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {showAddClient && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <form onSubmit={handleAddClient} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <input
                        type="text"
                        placeholder="Name"
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      />
                      <input
                        type="text"
                        placeholder="NIP"
                        value={newClient.nip}
                        onChange={(e) => setNewClient({ ...newClient, nip: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-sm"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddClient(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                          {client.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">{client.email}</p>
                        <p className="text-xs text-gray-500">NIP: {client.nip}</p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                        <button
                          onClick={() => handleEditClick(client)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h2v2h2v-2h2v-2h-2v-2h-2v2H9v2z"
                            />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleCreateInvoice(client.id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Invoices Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Invoices
              </h3>
            </div>

            <div className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {invoices.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-10 w-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                      Create the first invoice for a client.
                    </p>
                  </div>
                ) : (
                  invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                            {invoice.invoiceNumber}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">
                            Client: {invoice.client.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Issued: {new Date(invoice.issueDate).toLocaleDateString('en-US')}
                          </p>
                          <p className="text-xs text-gray-500">
                            Due date: {new Date(invoice.dueDate).toLocaleDateString('en-US')}
                          </p>
                          <p className="text-xs text-gray-500">
                            Status:{' '}
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                invoice.status === 'sent'
                                  ? 'bg-blue-100 text-blue-800'
                                  : invoice.status === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : invoice.status === 'generated'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {invoice.status || 'draft'}
                            </span>
                          </p>
                          {invoice.data?.total && (
                            <p className="text-xs text-gray-500">
                              Amount: {invoice.data.total.toFixed(2)} zł
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleInvoicePreview(invoice)}
                            className="inline-flex items-center px-2 sm:px-3 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span className="hidden sm:inline">Preview</span>
                            <span className="sm:hidden">👁</span>
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(invoice)}
                            className="inline-flex items-center px-2 sm:px-3 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            <span className="hidden sm:inline">PDF</span>
                            <span className="sm:hidden">📄</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal edycji pozycji faktury */}
      {showInvoiceEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowInvoiceEditModal(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Edit Invoice Items</h3>
              <p className="text-gray-600 text-sm">Customize items before creating invoice</p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-700">Invoice Items</h4>
                <button
                  onClick={handleAddInvoiceItem}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {editingInvoiceItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-medium text-gray-700">Item {index + 1}</h5>
                      <button
                        onClick={() => handleRemoveInvoiceItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateInvoiceItem(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Service/Product Name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateInvoiceItem(
                              index,
                              'quantity',
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price (zł)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleUpdateInvoiceItem(
                              index,
                              'unitPrice',
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Value (zł)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.total}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleUpdateInvoiceItem(index, 'description', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Item description (optional)"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {editingInvoiceItems.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-end">
                  <div className="w-64 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Net Value:</span>
                      <span className="font-semibold">
                        {editingInvoiceItems
                          .reduce((sum, item) => sum + (item.total || 0), 0)
                          .toFixed(2)}{' '}
                        zł
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">VAT (23%):</span>
                      <span className="font-semibold">
                        {(
                          editingInvoiceItems.reduce((sum, item) => sum + (item.total || 0), 0) *
                          0.23
                        ).toFixed(2)}{' '}
                        zł
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-200 font-semibold text-lg">
                      <span>Total:</span>
                      <span>
                        {(
                          editingInvoiceItems.reduce((sum, item) => sum + (item.total || 0), 0) *
                          1.23
                        ).toFixed(2)}{' '}
                        zł
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowInvoiceEditModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInvoice}
                disabled={editingInvoiceItems.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal edycji klienta */}
      {showEditModal && editClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowEditModal(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h3 className="text-lg font-semibold mb-4">Edit Client</h3>
            <div className="space-y-3 mb-4">
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                placeholder="Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                placeholder="Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="nip"
                value={editForm.nip}
                onChange={handleEditChange}
                placeholder="NIP"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {editError && <div className="text-red-600 text-sm mb-2">{editError}</div>}
            <button
              onClick={handleEditSave}
              disabled={editLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
            {/* Historia zmian */}
            <div className="mt-8">
              <h4 className="text-md font-semibold mb-2">Change History ({changeLogs.length})</h4>
              <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                {changeLogs.length === 0 && <div className="text-gray-400 text-sm">No changes</div>}
                {changeLogs.map((log) => (
                  <div key={log.id} className="py-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        {log.user?.username || 'User'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(log.changedAt).toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className="text-gray-500">{log.field}</span>:
                      <span className="line-through text-red-500 mx-1">
                        {JSON.stringify(log.before)}
                      </span>
                      <span className="text-green-600 mx-1">{JSON.stringify(log.after)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal podglądu faktury */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowInvoiceModal(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">
                Invoice {selectedInvoice.invoiceNumber}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Seller Information</h4>
                  <p className="text-gray-600">Your Company Sp. z o.o.</p>
                  <p className="text-gray-600">ul. Example 123, 00-000 Warsaw</p>
                  <p className="text-gray-600">NIP: 123-456-78-90</p>
                  <p className="text-gray-600">Email: invoices@yourcompany.pl</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Buyer Information</h4>
                  <p className="text-gray-600">{selectedInvoice.client.name}</p>
                  <p className="text-gray-600">Email: {selectedInvoice.client.email}</p>
                  <p className="text-gray-600">NIP: {selectedInvoice.client.nip}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Issue date:</span>
                  <p className="text-gray-600">
                    {new Date(selectedInvoice.issueDate).toLocaleDateString('en-US')}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Due date:</span>
                  <p className="text-gray-600">
                    {new Date(selectedInvoice.dueDate).toLocaleDateString('en-US')}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Status:</span>
                  <p className="text-gray-600">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedInvoice.status === 'sent'
                          ? 'bg-blue-100 text-blue-800'
                          : selectedInvoice.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : selectedInvoice.status === 'generated'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {selectedInvoice.status || 'draft'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {selectedInvoice.data?.items && selectedInvoice.data.items.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Invoice Items</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-700">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-700">
                          Unit Price
                        </th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-700">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.data.items.map((item: any, index: number) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="px-4 py-2 text-gray-700">{item.name}</td>
                          <td className="px-4 py-2 text-right text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-2 text-right text-gray-600">
                            {item.unitPrice?.toFixed(2)} zł
                          </td>
                          <td className="px-4 py-2 text-right text-gray-600">
                            {item.total?.toFixed(2)} zł
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedInvoice.data && (
              <div className="mb-6">
                <div className="flex justify-end">
                  <div className="w-64 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Net value:</span>
                      <span className="font-semibold">
                        {selectedInvoice.data.subtotal?.toFixed(2)} zł
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">VAT ({selectedInvoice.data.vatRate}%):</span>
                      <span className="font-semibold">
                        {selectedInvoice.data.vatAmount?.toFixed(2)} zł
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-200 font-semibold text-lg">
                      <span>Total:</span>
                      <span>{selectedInvoice.data.total?.toFixed(2)} zł</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">Payment Information</h4>
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold">Bank:</span> Example Bank S.A.
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Account number:</span> 12 1234 5678 9012 3456 7890
                  1234
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">SWIFT:</span> EXAPLXX
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">IBAN:</span> PL12 1234 5678 9012 3456 7890 1234
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handleDownloadPDF(selectedInvoice)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Download PDF
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
