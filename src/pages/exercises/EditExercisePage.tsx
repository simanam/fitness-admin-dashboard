// src/pages/exercises/EditExercisePage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ExerciseForm from '../../components/exercises/form/ExerciseForm';
import { useExerciseForm } from '../../hooks/useExerciseForm';
import { useToast } from '../../hooks/useToast';
import exerciseService from '../../api/exerciseService';
import { ExerciseFormData } from '../../types/exerciseFormTypes';

const EditExercisePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<
    ExerciseFormData | undefined
  >();

  const { handleSubmit, handleCancel, isSubmitting } = useExerciseForm({
    exerciseId: id,
    initialData,
  });

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        if (!id) return;

        const exercise = await exerciseService.getExercise(id);

        // Transform the API data to match form data structure
        const formData: ExerciseFormData = {
          name: exercise.name,
          description: exercise.description,
          difficulty: exercise.difficulty,
          movement_pattern: exercise.movement_pattern,
          mechanics: exercise.mechanics,
          force: exercise.force,
          equipment_required: exercise.equipment_required,
          bilateral: exercise.bilateral,
          plane_of_motion: exercise.plane_of_motion,
          status: exercise.status,
          instructions: exercise.instructions || '',
        };

        setInitialData(formData);
      } catch (error) {
        console.error('Error fetching exercise:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load exercise data',
        });
        navigate('/exercises');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercise();
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
          onClick={() => navigate(`/exercises/${id}`)}
          className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Exercise</h1>
          <p className="text-sm text-gray-500">{initialData.name}</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ExerciseForm
          initialData={initialData}
          exerciseId={id}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default EditExercisePage;
