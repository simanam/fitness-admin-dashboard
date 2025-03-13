// src/hooks/useClientForm.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './useToast';
import {
  ClientFormData,
  defaultClientFormData,
} from '../types/clientFormTypes';
import clientService from '../api/clientService';

interface UseClientFormProps {
  clientId?: string;
  initialData?: ClientFormData;
}

export const useClientForm = ({
  clientId,
  initialData,
}: UseClientFormProps = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>(
    initialData || defaultClientFormData
  );
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    try {
      if (clientId) {
        // Update existing client
        await clientService.updateClient(clientId, data);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Client updated successfully',
        });
        navigate(`/clients/${clientId}`);
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
        message: clientId
          ? 'Failed to update client'
          : 'Failed to create client',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (clientId) {
      navigate(`/clients/${clientId}`);
    } else {
      navigate('/clients');
    }
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    handleSubmit,
    handleCancel,
  };
};

export default useClientForm;
