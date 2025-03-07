// src/pages/exercises/CreateExercisePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ExerciseForm from '../../components/exercises/form/ExerciseForm';
import { useExerciseForm } from '../../hooks/useExerciseForm';

const CreateExercisePage: React.FC = () => {
  const navigate = useNavigate();
  const { handleSubmit, handleCancel, isSubmitting } = useExerciseForm();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button
          onClick={() => navigate('/exercises')}
          className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Exercise</h1>
          <p className="text-sm text-gray-500">
            Add a new exercise to the database
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ExerciseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default CreateExercisePage;
