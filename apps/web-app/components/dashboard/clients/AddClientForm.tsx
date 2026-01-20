import { NewClient } from '../../../types/client';

interface AddClientFormProps {
  form: NewClient;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
  error?: string;
}

export default function AddClientForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  loading,
  error,
}: AddClientFormProps) {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={onChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            required
          />
          <input
            type="text"
            name="nip"
            placeholder="NIP"
            value={form.nip}
            onChange={onChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            required
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
