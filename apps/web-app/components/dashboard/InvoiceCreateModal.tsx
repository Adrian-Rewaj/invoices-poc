import { InvoiceItem } from '../../types/invoice-item';

interface InvoiceCreateModalProps {
  setShowInvoiceEditModal: (show: boolean) => void;
  onAddInvoiceItem: () => void;
  invoiceItems: InvoiceItem[];
  onRemoveInvoiceItem: (index: number) => void;
  onUpdateInvoiceItem: (index: number, field: string, value: string | number) => void;
  onSaveInvoice: () => void;
}

export function InvoiceCreateModal({
  setShowInvoiceEditModal,
  onAddInvoiceItem,
  invoiceItems,
  onRemoveInvoiceItem,
  onUpdateInvoiceItem,
  onSaveInvoice,
}: InvoiceCreateModalProps) {
  return (
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
              onClick={onAddInvoiceItem}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {invoiceItems.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h5 className="font-medium text-gray-700">Item {index + 1}</h5>
                  <button
                    onClick={() => onRemoveInvoiceItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      onChange={(e) => onUpdateInvoiceItem(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Service/Product Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        onUpdateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 1)
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
                        onUpdateInvoiceItem(index, 'unitPrice', parseFloat(e.target.value) || 0)
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
                    onChange={(e) => onUpdateInvoiceItem(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Item description (optional)"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {invoiceItems.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-end">
              <div className="w-64 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Net Value:</span>
                  <span className="font-semibold">
                    {invoiceItems.reduce((sum, item) => sum + (item.total || 0), 0).toFixed(2)} zł
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">VAT (23%):</span>
                  <span className="font-semibold">
                    {(
                      invoiceItems.reduce((sum, item) => sum + (item.total || 0), 0) * 0.23
                    ).toFixed(2)}{' '}
                    zł
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200 font-semibold text-lg">
                  <span>Total:</span>
                  <span>
                    {(
                      invoiceItems.reduce((sum, item) => sum + (item.total || 0), 0) * 1.23
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
            onClick={onSaveInvoice}
            disabled={invoiceItems.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
