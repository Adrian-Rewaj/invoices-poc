'use client';

import Header from '../../components/dashboard/Header';
import StatsCard from '../../components/dashboard/StatsCard';
import ClientsList from './clients/ClientsList';
import { ClientEditModal } from './clients/ClientEditModal';
import InvoicesList from './invoices/InvoicesList';
import InvoiceCreateModal from './invoices/InvoiceCreateModal';
import InvoicePreviewModal from './invoices/InvoicePreviewModal';
import { useClientsQuery } from '../../lib/clients/useClientsQuery';
import { useClientEditModal } from '../../lib/clients/useClientEditModal';
import { useClientForm } from '../../lib/clients/useClientForm';
import { useClientChangeLogs } from '../../lib/clients/useClientChangeLogs';
import { useUpdateClient } from '../../lib/clients/useUpdateClient';
import { useInvoicesQuery } from '../../lib/invoices/useInvoicesQuery';
import { useInvoiceCreate } from '../../lib/invoices/useInvoiceCreate';
import { useInvoicePreview } from '../../lib/invoices/useInvoicePreview';

export function Dashboard() {
  const { clients, setClients, isLoading: clientsLoading, error: clientsError } = useClientsQuery();
  const editModal = useClientEditModal();
  const editForm = useClientForm(editModal.client ?? undefined);
  const { logs: changeLogs } = useClientChangeLogs(editModal.client?.id);

  const {
    updateClient,
    loading: mutationLoading,
    error: mutationError,
  } = useUpdateClient({
    onClientUpdated: (client) =>
      setClients((prev) => prev.map((c) => (c.id === client.id ? client : c))),
  });

  const handleEditClientSubmit = async () => {
    if (!editModal.client) return;
    await updateClient(editModal.client.id, editForm.form);
    editModal.close();
  };

  const handleEditClient = (client: any) => editModal.open(client);

  const {
    invoices,
    setInvoices,
    isLoading: invoicesLoading,
    error: invoicesError,
  } = useInvoicesQuery();
  const invoiceCreate = useInvoiceCreate({
    onInvoiceCreated: (inv) => setInvoices([inv, ...invoices]),
  });
  const invoicePreview = useInvoicePreview();

  if (clientsLoading || invoicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />

      {(clientsError || mutationError || invoicesError) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-red-700">{clientsError || mutationError || invoicesError}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <StatsCard clientsNumber={clients.length} invoicesNumber={invoices.length} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-6">
          <ClientsList
            clients={clients}
            onEditClient={handleEditClient}
            onCreateInvoice={invoiceCreate.startCreating}
            onClientAdded={(client) => setClients([client, ...clients])}
          />
          <InvoicesList
            invoices={invoices}
            onInvoicePreview={invoicePreview.openPreview}
            onDownloadPDF={invoicePreview.downloadPDF}
          />
        </div>
      </div>

      {invoiceCreate.showModal && (
        <InvoiceCreateModal
          setShowInvoiceEditModal={invoiceCreate.setShowModal}
          invoiceItems={invoiceCreate.invoiceItems}
          onAddInvoiceItem={invoiceCreate.addItem}
          onRemoveInvoiceItem={invoiceCreate.removeItem}
          onUpdateInvoiceItem={invoiceCreate.updateItem}
          onSaveInvoice={invoiceCreate.saveInvoice}
          isSaving={invoiceCreate.isSaving}
          error={invoiceCreate.error}
        />
      )}

      {editModal.isOpen && editModal.client && (
        <ClientEditModal
          setShowEditClientModal={editModal.close}
          editForm={editForm.form}
          onEditChange={editForm.handleChange}
          editError={mutationError}
          onEditSave={handleEditClientSubmit}
          editLoading={mutationLoading}
          changeLogs={changeLogs}
        />
      )}

      {invoicePreview.showModal && invoicePreview.selectedInvoice && (
        <InvoicePreviewModal
          setShowInvoiceModal={invoicePreview.setShowModal}
          selectedInvoice={invoicePreview.selectedInvoice}
          handleDownloadPDF={invoicePreview.downloadPDF}
          isDownloading={invoicePreview.isDownloading}
          error={invoicePreview.error}
        />
      )}
    </div>
  );
}
