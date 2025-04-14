// src/pages/clients/ClientDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Key,
  BarChart,
  Mail,
  Phone,
  User,
  Building,
  Calendar,
  Ban,
  Plus,
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import type { Client } from '../../api/clientService';
import clientService from '../../api/clientService';
import ConfirmationDialog from '../../components/ui/confirmation-dialog';
import Modal from '../../components/ui/modal';
import StatusBadge from '../../components/clients/StatusBadge';
import TierBadge from '../../components/clients/TierBadge';
import ApiKeyList from '../../components/clients/ApiKeyList';
import CreateApiKeyForm from '../../components/clients/CreateApiKeyForm';
import type { CreateKeyParams } from '../../api/apiKeyService';
import useApiKeys from '../../hooks/useApiKeys';
import { Textarea } from '../../components/ui/textarea';
import { formatDistanceToNow, format } from 'date-fns';

type TabKey = 'overview' | 'api-keys' | 'statistics';

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  const {
    apiKeys,
    isLoading: isLoadingKeys,
    revokeApiKey,
    rotateApiKey,
    createApiKey,
  } = useApiKeys(id || '');

  // Fetch client data
  useEffect(() => {
    if (!id) return;

    const fetchClient = async () => {
      setIsLoading(true);
      try {
        const data = await clientService.getClient(id);
        setClient(data);
      } catch (error) {
        console.error('Error fetching client:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load client details.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [id, showToast]);

  // Handle client suspension
  const handleSuspend = async () => {
    if (!client || !suspendReason.trim()) return;

    setIsActionInProgress(true);
    try {
      await clientService.suspendClient(client.id, suspendReason);

      // Update client data
      const updatedClient = await clientService.getClient(client.id);
      setClient(updatedClient);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Client suspended successfully',
      });

      setShowSuspendDialog(false);
      setSuspendReason('');
    } catch (error) {
      console.error('Error suspending client:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to suspend client',
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Handle client reactivation
  const handleReactivate = async () => {
    if (!client) return;

    setIsActionInProgress(true);
    try {
      await clientService.reactivateClient(client.id);

      // Update client data
      const updatedClient = await clientService.getClient(client.id);
      setClient(updatedClient);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Client reactivated successfully',
      });

      setShowReactivateDialog(false);
    } catch (error) {
      console.error('Error reactivating client:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to reactivate client',
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Handle creating a new API key
  const handleCreateKey = async (params: CreateKeyParams) => {
    setIsCreatingKey(true);
    try {
      await createApiKey(params);
      setShowCreateKeyModal(false);
    } finally {
      setIsCreatingKey(false);
    }
  };

  const tabs = [
    {
      key: 'overview',
      label: 'Overview',
      icon: <User className="h-4 w-4 mr-2" />,
    },
    {
      key: 'api-keys',
      label: 'API Keys',
      icon: <Key className="h-4 w-4 mr-2" />,
    },
    {
      key: 'statistics',
      label: 'Statistics',
      icon: <BarChart className="h-4 w-4 mr-2" />,
    },
  ];

  // Render appropriate component based on active tab
  const renderTabContent = () => {
    if (!client) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Main client information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Client Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Building className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Company
                        </h4>
                        <p className="text-sm text-gray-500">
                          {client.companyName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Email
                        </h4>
                        <p className="text-sm text-gray-500">{client.email}</p>
                      </div>
                    </div>
                    {client.accountOwner && (
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Account Owner
                          </h4>
                          <p className="text-sm text-gray-500">
                            {client.accountOwner}
                          </p>
                        </div>
                      </div>
                    )}
                    {client.contactPhone && (
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Phone
                          </h4>
                          <p className="text-sm text-gray-500">
                            {client.contactPhone}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Created
                        </h4>
                        <p className="text-sm text-gray-500">
                          {format(new Date(client.createdAt), 'PPP')} (
                          {formatDistanceToNow(new Date(client.createdAt), {
                            addSuffix: true,
                          })}
                          )
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {client.description && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Description
                    </h3>
                    <p className="text-sm text-gray-500 whitespace-pre-line">
                      {client.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Additional Contacts
                  </h3>
                  <div className="space-y-3">
                    {client.technicalContactEmail && (
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Technical Contact
                          </h4>
                          <p className="text-sm text-gray-500">
                            {client.technicalContactEmail}
                          </p>
                        </div>
                      </div>
                    )}
                    {client.billingEmail && (
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Billing Contact
                          </h4>
                          <p className="text-sm text-gray-500">
                            {client.billingEmail}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Account Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Status
                        </p>
                        <StatusBadge status={client.status} className="mt-1" />
                      </div>
                      <div>
                        {client.status === 'active' ? (
                          <button
                            type="button"
                            onClick={() => setShowSuspendDialog(true)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Suspend
                          </button>
                        ) : client.status === 'suspended' ? (
                          <button
                            type="button"
                            onClick={() => setShowReactivateDialog(true)}
                            className="text-sm text-green-600 hover:text-green-800"
                          >
                            Reactivate
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Tier
                        </p>
                        <TierBadge tier={client.tier} className="mt-1" />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/clients/${client.id}/edit?section=tier`)
                          }
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    {client.monthlyQuota && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">
                          Monthly Request Quota
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {client.monthlyQuota.toLocaleString()} requests
                        </p>
                      </div>
                    )}

                    {client.rateLimit && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">
                          Rate Limit
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {client.rateLimit} requests per minute
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Suspension details if suspended */}
            {client.status === 'suspended' && client.suspendedAt && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <h3 className="text-md font-medium text-red-800 flex items-center">
                  <Ban className="h-5 w-5 mr-2" />
                  Account Suspended
                </h3>
                <p className="mt-1 text-sm text-red-600">
                  Suspended{' '}
                  {formatDistanceToNow(new Date(client.suspendedAt), {
                    addSuffix: true,
                  })}
                </p>
                {client.suspendedReason && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-800">
                      Reason for suspension:
                    </p>
                    <p className="text-sm text-red-600">
                      {client.suspendedReason}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'api-keys':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
              <button
                type="button"
                onClick={() => setShowCreateKeyModal(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-black hover:bg-gray-800"
                disabled={client.status !== 'active'}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create API Key
              </button>
            </div>

            {client.status !== 'active' && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-sm text-yellow-700">
                <p className="flex items-center">
                  <Ban className="h-5 w-5 mr-2 text-yellow-500" />
                  API key creation is disabled because this client is not
                  active.
                </p>
              </div>
            )}

            <ApiKeyList
              apiKeys={apiKeys}
              isLoading={isLoadingKeys}
              onRevoke={revokeApiKey}
              onRotate={rotateApiKey}
            />
          </div>
        );

      case 'statistics':
        return (
          <div className="text-center py-12">
            <BarChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              Statistics coming soon
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Detailed API usage metrics will be available in a future update.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  // Show error state if client not found
  if (!client) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Client not found</h3>
        <p className="mt-2 text-sm text-gray-500">
          The client you're looking for doesn't exist or has been removed.
        </p>
        <button
          type="button"
          onClick={() => navigate('/clients')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button, actions and title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <StatusBadge status={client.status} />
              <TierBadge tier={client.tier} />
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => navigate(`/clients/${id}/edit`)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit size={16} className="mr-1" />
            Edit
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`py-4 px-6 text-sm font-medium border-b-2 whitespace-nowrap flex items-center ${
                activeTab === tab.key
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {renderTabContent()}
      </div>

      {/* Suspend client dialog */}
      <ConfirmationDialog
        isOpen={showSuspendDialog}
        onClose={() => {
          setShowSuspendDialog(false);
          setSuspendReason('');
        }}
        onConfirm={handleSuspend}
        title="Suspend Client"
        message={
          <div>
            <p className="mb-4">
              Are you sure you want to suspend{' '}
              <span className="font-medium">{client?.name}</span>? This will
              immediately revoke their API access.
            </p>
            <div>
              <label
                htmlFor="suspendReason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Reason for suspension <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="suspendReason"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Please provide a reason for suspension..."
                rows={3}
                disabled={isActionInProgress}
              />
            </div>
          </div>
        }
        confirmText="Suspend Client"
        type="danger"
        isLoading={isActionInProgress}
      />

      {/* Reactivate client dialog */}
      <ConfirmationDialog
        isOpen={showReactivateDialog}
        onClose={() => setShowReactivateDialog(false)}
        onConfirm={handleReactivate}
        title="Reactivate Client"
        message={
          <p>
            Are you sure you want to reactivate{' '}
            <span className="font-medium">{client?.name}</span>? This will
            restore their API access.
          </p>
        }
        confirmText="Reactivate Client"
        type="info"
        isLoading={isActionInProgress}
      />

      {/* Create API key modal */}
      <Modal
        isOpen={showCreateKeyModal}
        onClose={() => setShowCreateKeyModal(false)}
        title="Create API Key"
        size="md"
      >
        <CreateApiKeyForm
          onSubmit={handleCreateKey}
          onCancel={() => setShowCreateKeyModal(false)}
          isSubmitting={isCreatingKey}
        />
      </Modal>
    </div>
  );
};

export default ClientDetail;
