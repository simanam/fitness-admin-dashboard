// src/pages/equipment/CreateEquipmentPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EquipmentForm from '../../components/equipment/form/EquipmentForm';
import { useEquipmentForm } from '../../hooks/useEquipmentForm';

const CreateEquipmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { handleSubmit, handleCancel, isSubmitting } = useEquipmentForm();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button
          onClick={() => navigate('/equipment')}
          className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Equipment</h1>
          <p className="text-sm text-gray-500">
            Add a new equipment to the database
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <EquipmentForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default CreateEquipmentPage;
