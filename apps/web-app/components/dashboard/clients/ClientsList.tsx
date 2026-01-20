import { Client, NewClient } from '../../../types/client';
import { useState } from 'react';
import AddClientForm from './AddClientForm';
import { useAddClient } from '../../../lib/clients/useAddClient';

interface ClientsListProps {
  clients: Client[];
  onEditClient: (client: Client) => void;
  onCreateInvoice: (clientId: number) => void;
  onClientAdded: (client: Client) => void;
}

export default function ClientsList({
  clients,
  onEditClient,
  onCreateInvoice,
  onClientAdded,
}: ClientsListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState<NewClient>({ name: '', email: '', nip: '' });

  const { addClient, loading, error } = useAddClient({
    onClientAdded: (client) => {
      onClientAdded(client);
      setShowAddForm(false);
      setNewClient({ name: '', email: '', nip: '' });
    },
  });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
            Clients
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
          >
            Add Client
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {showAddForm && (
          <AddClientForm
            form={newClient}
            onChange={(e) => setNewClient({ ...newClient, [e.target.name]: e.target.value })}
            onSubmit={() => addClient(newClient)}
            onCancel={() => setShowAddForm(false)}
            loading={loading}
            error={error}
          />
        )}

        {clients.length === 0 && (
          <div className="text-sm text-gray-500 text-center">No clients yet</div>
        )}
        <div className="space-y-3 sm:space-y-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {client.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">{client.email}</p>
                  <p className="text-xs text-gray-500">NIP: {client.nip}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => onEditClient(client)}
                    className="inline-flex items-center px-3 py-2 text-xs sm:text-sm rounded-lg border border-gray-300 text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onCreateInvoice(client.id)}
                    className="inline-flex items-center px-3 py-2 text-xs sm:text-sm rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  >
                    Invoice
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
