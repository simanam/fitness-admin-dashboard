// src/components/clients/CreateApiKeyForm.tsx
import React, { useState } from 'react';
import { Key } from 'lucide-react';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { CreateKeyParams } from '../../api/apiKeyService';

interface CreateApiKeyFormProps {
  onSubmit: (params: CreateKeyParams) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const CreateApiKeyForm: React.FC<CreateApiKeyFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [name, setName] = useState('');
  const [keyType, setKeyType] = useState<'primary' | 'temporary'>('temporary');
  const [expirationDays, setExpirationDays] = useState('90');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) return;

    // Convert expiration days to milliseconds
    let expiresIn: number | undefined = undefined;
    if (keyType === 'temporary') {
      const days = parseInt(expirationDays, 10);
      if (!isNaN(days) && days > 0) {
        expiresIn = days * 24 * 60 * 60 * 1000; // Convert days to milliseconds
      }
    }

    await onSubmit({
      keyType,
      name: name.trim(),
      expiresIn,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="key-name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Key Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="key-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Production API Key, Development Key"
          required
          disabled={isSubmitting}
        />
        <p className="mt-1 text-xs text-gray-500">
          Choose a descriptive name to identify this key's purpose
        </p>
      </div>

      <div>
        <label
          htmlFor="key-type"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Key Type <span className="text-red-500">*</span>
        </label>
        <Select
          id="key-type"
          value={keyType}
          onChange={(e) =>
            setKeyType(e.target.value as 'primary' | 'temporary')
          }
          disabled={isSubmitting}
        >
          <option value="primary">Primary (No expiration)</option>
          <option value="temporary">Temporary (With expiration)</option>
        </Select>
        <p className="mt-1 text-xs text-gray-500">
          Primary keys don't expire automatically. Temporary keys are good for
          testing or time-limited access.
        </p>
      </div>

      {keyType === 'temporary' && (
        <div>
          <label
            htmlFor="expiration"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Expiration Period (Days) <span className="text-red-500">*</span>
          </label>
          <Select
            id="expiration"
            value={expirationDays}
            onChange={(e) => setExpirationDays(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="180">180 days</option>
            <option value="365">365 days</option>
          </Select>
          <p className="mt-1 text-xs text-gray-500">
            The key will automatically expire after this period
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500 flex items-center">
          <Key className="h-4 w-4 mr-1.5" />
          New API key details will be shown only once
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create API Key'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateApiKeyForm;
