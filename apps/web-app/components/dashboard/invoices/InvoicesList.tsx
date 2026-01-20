import { Invoice } from '../../../types/invoice';

interface InvociesListProps {
  invoices: Invoice[];
  onInvoicePreview: (invoice: Invoice) => void;
  onDownloadPDF: (invoice: Invoice) => void;
}

export default function InvoicesList({
  invoices,
  onInvoicePreview,
  onDownloadPDF,
}: InvociesListProps) {
  return (
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
                      onClick={() => onInvoicePreview(invoice)}
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
                      onClick={() => onDownloadPDF(invoice)}
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
  );
}
