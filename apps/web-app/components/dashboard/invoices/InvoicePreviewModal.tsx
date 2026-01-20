import { Invoice } from '../../../types/invoice';
import { InvoiceItem } from '../../../types/invoice-item';

interface InvoicePreviewModalProps {
  setShowInvoiceModal: (show: boolean) => void;
  selectedInvoice: Invoice;
  handleDownloadPDF: (invoice: Invoice) => void;
  isDownloading: boolean;
  error: string;
}

export default function InvoicePreviewModal({
  setShowInvoiceModal,
  selectedInvoice,
  handleDownloadPDF,
  isDownloading,
  error,
}: InvoicePreviewModalProps) {
  return (
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
          <h3 className="text-xl font-semibold mb-2">Invoice {selectedInvoice.invoiceNumber}</h3>
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
                    <th className="px-4 py-2 text-right font-semibold text-gray-700">Quantity</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-700">Unit Price</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-700">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.data.items.map((item: InvoiceItem, index: number) => (
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

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => handleDownloadPDF(selectedInvoice)}
            disabled={isDownloading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isDownloading ? 'Downloading...' : 'Download PDF'}
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
  );
}
