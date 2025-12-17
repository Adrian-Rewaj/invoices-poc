import { ClientChangeLog, NewClient } from '../../types/client';

interface ClientEditModalProps {
  setShowEditClientModal: (show: boolean) => void;
  editForm: NewClient;
  onEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editError: string;
  onEditSave: () => void;
  editLoading: boolean;
  changeLogs: ClientChangeLog[];
}

export function ClientEditModal({
  setShowEditClientModal,
  editForm,
  onEditChange,
  editError,
  onEditSave,
  editLoading,
  changeLogs,
}: ClientEditModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={() => setShowEditClientModal(false)}
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
            onChange={onEditChange}
            placeholder="Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="email"
            value={editForm.email}
            onChange={onEditChange}
            placeholder="Email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="nip"
            value={editForm.nip}
            onChange={onEditChange}
            placeholder="NIP"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {editError && <div className="text-red-600 text-sm mb-2">{editError}</div>}
        <button
          onClick={onEditSave}
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
                  <span className="font-medium text-gray-700">{log.user?.username || 'User'}</span>
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
  );
}
