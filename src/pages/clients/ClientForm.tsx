// src/pages/clients/ClientForm.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, X, ChevronRight } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import clientService from '../../api/clientService';
import {
  ClientFormData,
  defaultClientFormData,
  FORM_VALIDATION_RULES,
  CLIENT_TIERS,
} from '../../types/clientFormTypes';
import useClientForm from '../../hooks/useClientForm';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';

const ClientForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(id ? true : false);
  const [activeSection, setActiveSection] = useState(0);

  // Get the section from URL query if present
  const queryParams = new URLSearchParams(location.search);
  const sectionParam = queryParams.get('section');

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, isValid },
    reset,
    setValue,
  } = useForm<ClientFormData>({
    defaultValues: defaultClientFormData,
    mode: 'onChange',
  });

  // Fetch client data if editing
  useEffect(() => {
    const fetchClient = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const data = await clientService.getClient(id);

        // Set form values
        reset({
          name: data.name,
          email: data.email,
          companyName: data.companyName,
          description: data.description || '',
          accountOwner: data.accountOwner || '',
          contactPhone: data.contactPhone || '',
          technicalContactEmail: data.technicalContactEmail || '',
          billingEmail: data.billingEmail || '',
          tier: data.tier,
        });

        // If section param is present, activate that section
        if (sectionParam === 'tier') {
          setActiveSection(2);
        }
      } catch (error) {
        console.error('Error fetching client:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load client data',
        });
        navigate('/clients');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [id, reset, navigate, showToast, sectionParam]);

  // Handle form submission
  const onSubmit = async (data: ClientFormData) => {
    try {
      if (id) {
        // Update existing client
        await clientService.updateClient(id, data);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Client updated successfully',
        });
        navigate(`/clients/${id}`);
      } else {
        // Create new client
        const newClient = await clientService.createClient(data);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Client created successfully',
        });
        navigate(`/clients/${newClient.id}`);
      }
    } catch (error) {
      console.error('Error submitting client:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: id ? 'Failed to update client' : 'Failed to create client',
      });
    }
  };

  // Form sections
  const sections = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Enter the basic details about the API client',
    },
    {
      id: 'contacts',
      title: 'Contact Information',
      description:
        'Specify contacts for account, technical and billing purposes',
    },
    {
      id: 'settings',
      title: 'Account Settings',
      description: 'Configure account tier and limits',
    },
  ];

  const handleNext = () => {
    if (activeSection < sections.length - 1) {
      setActiveSection((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (activeSection > 0) {
      setActiveSection((prev) => prev - 1);
    }
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Render the form
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button
          onClick={() => navigate(id ? `/clients/${id}` : '/clients')}
          className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Edit Client' : 'New Client'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Progress steps */}
        <div className="border-b border-gray-200 pb-4">
          <nav className="flex justify-between">
            {sections.map((section, index) => (
              <div key={section.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setActiveSection(index)}
                  className={`flex items-center ${
                    index === activeSection
                      ? 'text-black'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span
                    className={`
                      w-8 h-8 flex items-center justify-center rounded-full border-2
                      ${index <= activeSection ? 'border-black bg-black text-white' : 'border-gray-300'}
                    `}
                  >
                    {index + 1}
                  </span>
                  <span className="ml-2 font-medium text-sm">
                    {section.title}
                  </span>
                </button>

                {index < sections.length - 1 && (
                  <ChevronRight className="h-5 w-5 text-gray-400 mx-2" />
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Form sections */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            {sections[activeSection].title}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {sections[activeSection].description}
          </p>

          {activeSection === 0 && (
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Name <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('name', FORM_VALIDATION_RULES.name)}
                  placeholder="My API Client"
                  error={errors.name?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register(
                    'companyName',
                    FORM_VALIDATION_RULES.companyName
                  )}
                  placeholder="Acme Inc."
                  error={errors.companyName?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  {...register('email', FORM_VALIDATION_RULES.email)}
                  placeholder="contact@example.com"
                  error={errors.email?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  {...register('description')}
                  placeholder="Describe the purpose of this API client..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {activeSection === 1 && (
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Owner
                </label>
                <Input {...register('accountOwner')} placeholder="John Doe" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <Input
                  {...register(
                    'contactPhone',
                    FORM_VALIDATION_RULES.contactPhone
                  )}
                  placeholder="+1 (555) 123-4567"
                  error={errors.contactPhone?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technical Contact Email
                </label>
                <Input
                  type="email"
                  {...register(
                    'technicalContactEmail',
                    FORM_VALIDATION_RULES.technicalContactEmail
                  )}
                  placeholder="tech@example.com"
                  error={errors.technicalContactEmail?.message}
                />
                <p className="mt-1 text-xs text-gray-500">
                  This contact will receive technical notifications about API
                  changes
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Contact Email
                </label>
                <Input
                  type="email"
                  {...register(
                    'billingEmail',
                    FORM_VALIDATION_RULES.billingEmail
                  )}
                  placeholder="billing@example.com"
                  error={errors.billingEmail?.message}
                />
                <p className="mt-1 text-xs text-gray-500">
                  This contact will receive billing-related notifications
                </p>
              </div>
            </div>
          )}

          {activeSection === 2 && (
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Tier <span className="text-red-500">*</span>
                </label>
                <Select
                  {...register('tier', FORM_VALIDATION_RULES.tier)}
                  error={errors.tier?.message}
                >
                  {CLIENT_TIERS.map((tier) => (
                    <option key={tier.value} value={tier.value}>
                      {tier.label} - {tier.description}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Tier information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Tier Features
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 flex justify-between">
                    <span>Monthly Request Quota:</span>
                    <span className="font-medium">
                      {CLIENT_TIERS.find(
                        (t) =>
                          t.value ===
                          (document.getElementById('tier') as HTMLSelectElement)
                            ?.value
                      )?.quota.toLocaleString() || '10,000'}{' '}
                      requests
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 flex justify-between">
                    <span>Rate Limit:</span>
                    <span className="font-medium">
                      {CLIENT_TIERS.find(
                        (t) =>
                          t.value ===
                          (document.getElementById('tier') as HTMLSelectElement)
                            ?.value
                      )?.rateLimit || '50'}{' '}
                      req/min
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation and action buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div>
            {activeSection > 0 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Previous
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => navigate(id ? `/clients/${id}` : '/clients')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </button>

            {activeSection < sections.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-1" />
                {isSubmitting ? 'Saving...' : 'Save Client'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;
