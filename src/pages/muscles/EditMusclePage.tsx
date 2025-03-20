// src/pages/muscles/EditMusclePage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MuscleForm from '../../components/muscles/form/MuscleForm';
import { useMuscleForm } from '../../hooks/useMuscleForm';
import { useToast } from '../../hooks/useToast';
import muscleService from '../../api/muscleService';
import { MuscleFormData } from '../../types/muscleFormTypes';

const EditMusclePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<MuscleFormData | undefined>();

  const { handleSubmit, handleCancel, isSubmitting } = useMuscleForm({
    muscleId: id,
    initialData,
  });

  useEffect(() => {
    const fetchMuscle = async () => {
      try {
        if (!id) return;

        const muscle = await muscleService.getMuscle(id);

        // Transform the API data to match form data structure
        const formData: MuscleFormData = {
          name: muscle.name,
          commonName: muscle.commonName || '',
          description: muscle.description || '',
          muscleGroupId: muscle.muscleGroupId,
          keepExistingSvg: true, // Default to keeping existing SVG
        };

        setInitialData(formData);
      } catch (error) {
        console.error('Error fetching muscle:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load muscle data',
        });
        navigate('/muscles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMuscle();
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
          onClick={() => navigate(`/muscles/${id}`)}
          className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Muscle</h1>
          <p className="text-sm text-gray-500">{initialData.name}</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <MuscleForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          muscleId={id}
        />
      </div>
    </div>
  );
};

export default EditMusclePage;
