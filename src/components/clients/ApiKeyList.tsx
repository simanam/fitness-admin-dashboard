// src/components/clients/ApiKeyList.tsx
import React, { useState } from 'react';
import {
  Key,
  Copy,
  RefreshCcw,
  Calendar,
  Clock,
  AlertCircle,
  Ban,
  X,
} from 'lucide-react';
import { ApiKey } from '../../api/apiKeyService';
import { formatDistanceToNow, format, isPast } from 'date-fns';
import ConfirmationDialog from '../ui/confirmation-dialog';
import { Textarea } from '../ui/textarea';
import { cn } from '../../lib/utils';

interface ApiKeyListProps {
  apiKeys: ApiKey[];
  isLoading: boolean;
  onRevoke: (keyId: string, reason: string) => Promise<boolean>;
  onRotate: (keyId: string) => Promise<ApiKey | null>;
}

const ApiKeyList: React.FC<ApiKeyListProps> = ({
  apiKeys,
  isLoading,
  onRevoke,
  onRotate,
}) => {
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [showRotateDialog, setShowRotateDialog] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [setVisibleSecrets] = useState<Record<string, boolean>>({});
  const [copiedKeyIds, setCopiedKeyIds] = useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = useState<ApiKey | null>(null);

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyIds((prev) => ({ ...prev, [keyId]: true }));

    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopiedKeyIds((prev) => ({ ...prev, [keyId]: false }));
    }, 2000);
  };

  const handleRevoke = async () => {
    if (!selectedKeyId || !revokeReason.trim()) return;

    setSubmitting(true);
    try {
      const success = await onRevoke(selectedKeyId, revokeReason);
      if (success) {
        setShowRevokeDialog(false);
        setRevokeReason('');
        setSelectedKeyId(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRotate = async () => {
    if (!selectedKeyId) return;

    setSubmitting(true);
    try {
      const rotatedKey = await onRotate(selectedKeyId);
      if (rotatedKey) {
        setNewKey(rotatedKey);
        setShowRotateDialog(false);
        setSelectedKeyId(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getKeyTypeColor = (keyType: string) => {
    switch (keyType) {
      case 'primary':
        return 'bg-blue-100 text-blue-800';
      case 'rotated':
        return 'bg-green-100 text-green-800';
      case 'temporary':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isActive = (key: ApiKey) => {
    return (
      !key.revokedAt && (!key.expiresAt || new Date(key.expiresAt) > new Date())
    );
  };

  const formatExpiry = (expiresAt: string | null) => {
    if (!expiresAt) return 'Never expires';

    const expiryDate = new Date(expiresAt);

    if (isPast(expiryDate)) {
      return `Expired ${formatDistanceToNow(expiryDate, { addSuffix: true })}`;
    }

    return `Expires ${formatDistanceToNow(expiryDate, { addSuffix: true })}`;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {newKey && (
        <div className="mb-6 p-4 border-2 border-green-500 bg-green-50 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-green-800 flex items-center">
                <Key className="h-5 w-5 mr-2" />
                New API Key Created
              </h3>
              <p className="mt-1 text-sm text-green-700">
                This key has been rotated. Make sure to copy the new key details
                as they won't be shown again.
              </p>
            </div>
            <button
              onClick={() => setNewKey(null)}
              className="text-green-700 hover:text-green-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-3 p-3 bg-white rounded border border-green-200">
            <div className="mb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  API Key:
                </span>
                <button
                  onClick={() => copyToClipboard(newKey.apiKey, 'new-key')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-1 font-mono text-sm bg-gray-50 p-2 rounded overflow-x-auto">
                {newKey.apiKey}
              </div>
            </div>

            {newKey.apiSecret && (
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    API Secret:
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(newKey.apiSecret!, 'new-secret')
                    }
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-1 font-mono text-sm bg-gray-50 p-2 rounded overflow-x-auto">
                  {newKey.apiSecret}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {apiKeys.length === 0 ? (
        <div className="text-center py-8">
          <Key className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">
            No API keys found
          </h3>
          <p className="mt-1 text-gray-500">
            This client doesn't have any API keys yet. Create one to enable API
            access.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className={cn(
                'border rounded-lg overflow-hidden bg-white',
                isActive(key) ? 'border-gray-200' : 'border-gray-200 bg-gray-50'
              )}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {key.name}
                      </h3>
                      <span
                        className={cn(
                          'ml-2 px-2 py-0.5 text-xs font-medium rounded-full',
                          getKeyTypeColor(key.keyType)
                        )}
                      >
                        {key.keyType.charAt(0).toUpperCase() +
                          key.keyType.slice(1)}
                      </span>
                      {key.revokedAt && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Revoked
                        </span>
                      )}
                      {key.expiresAt &&
                        new Date(key.expiresAt) < new Date() &&
                        !key.revokedAt && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                            Expired
                          </span>
                        )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        Created{' '}
                        {formatDistanceToNow(new Date(key.createdAt), {
                          addSuffix: true,
                        })}
                      </span>

                      {key.lastUsedAt && (
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1.5" />
                          Last used{' '}
                          {formatDistanceToNow(new Date(key.lastUsedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      )}

                      <span className="flex items-center">
                        {key.expiresAt && isPast(new Date(key.expiresAt)) ? (
                          <AlertCircle className="h-4 w-4 mr-1.5 text-orange-500" />
                        ) : (
                          <Calendar className="h-4 w-4 mr-1.5" />
                        )}
                        {formatExpiry(key.expiresAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {isActive(key) && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedKeyId(key.id);
                            setShowRotateDialog(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100"
                          title="Rotate Key"
                        >
                          <RefreshCcw size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedKeyId(key.id);
                            setShowRevokeDialog(true);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                          title="Revoke Key"
                        >
                          <Ban size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center">
                  <div className="flex-1 font-mono text-sm bg-gray-50 p-2 rounded relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="truncate">{key.apiKey}</div>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => copyToClipboard(key.apiKey, key.id)}
                          className="text-gray-500 hover:text-gray-700"
                          title="Copy API Key"
                        >
                          {copiedKeyIds[key.id] ? (
                            <span className="text-xs text-green-600">
                              Copied!
                            </span>
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {key.revokedAt && (
                  <div className="mt-2 bg-red-50 p-2 rounded text-sm text-red-800">
                    <span className="font-medium">Revoked reason:</span>{' '}
                    {key.revokedReason || 'No reason provided'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revoke dialog */}
      <ConfirmationDialog
        isOpen={showRevokeDialog}
        onClose={() => {
          setShowRevokeDialog(false);
          setRevokeReason('');
          setSelectedKeyId(null);
        }}
        onConfirm={handleRevoke}
        title="Revoke API Key"
        message={
          <div>
            <p className="mb-4 text-red-800">
              Are you sure you want to revoke this API key? This action cannot
              be undone and will immediately prevent the key from being used.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for revocation <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Please provide a reason for revoking this key..."
                rows={3}
                disabled={submitting}
                required
              />
            </div>
          </div>
        }
        confirmText="Revoke Key"
        type="danger"
        isLoading={submitting}
      />

      {/* Rotate dialog */}
      <ConfirmationDialog
        isOpen={showRotateDialog}
        onClose={() => {
          setShowRotateDialog(false);
          setSelectedKeyId(null);
        }}
        onConfirm={handleRotate}
        title="Rotate API Key"
        message={
          <div>
            <p className="mb-2">
              Rotating this key will generate a new key and invalidate the
              current one. Any systems using this key will need to be updated.
            </p>
            <p className="mb-4">
              The new key will be shown only once after rotation is complete.
              Make sure to copy it.
            </p>
            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
              <p className="text-yellow-800 text-sm flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>
                  This action cannot be undone. Are you sure you want to
                  proceed?
                </span>
              </p>
            </div>
          </div>
        }
        confirmText="Rotate Key"
        type="info"
        isLoading={submitting}
      />
    </div>
  );
};

export default ApiKeyList;
