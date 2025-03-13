// src/pages/equipment/EditEquipmentPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EquipmentForm from '../../components/equipment/form/EquipmentForm';
import { useEquipmentForm } from '../../hooks/useEquipmentForm';
import { useToast } from '../../hooks/useToast';
import equipmentService from '../../api/equipmentService';
import { EquipmentFormData } from '../../types/equipmentFormTypes';

const EditEquipmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<
    EquipmentFormData | undefined
  >();

  const { handleSubmit, handleCancel, isSubmitting } = useEquipmentForm({
    equipmentId: id,
    initialData,
  });

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        if (!id) return;

        const equipment = await equipmentService.getEquipmentById(id);

        // Transform the API data to match form data structure
        const formData: EquipmentFormData = {
          name: equipment.name,
          description: equipment.description || '',
          category: equipment.category,
          isCommon: equipment.isCommon,
          alternatives: equipment.alternatives || { equipment_options: [] },
        };

        setInitialData(formData);
      } catch (error) {
        console.error('Error fetching equipment:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load equipment data',
        });
        navigate('/equipment');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEquipment();
  }, [id, navigate, showToast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!initialData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button
          onClick={() => navigate(`/equipment/${id}`)}
          className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Equipment</h1>
          <p className="text-sm text-gray-500">{initialData.name}</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <EquipmentForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default EditEquipmentPage;
