// src/pages/movement-patterns/CreateMovementPatternPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import movementPatternService from '../../api/movementPatternService';
import MovementPatternForm from '../../components/movement-patterns/MovementPatternForm';

const CreateMovementPatternPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: {
    name: string;
    patternType: string;
    category: string;
    description: string;
  }) => {
    setIsSubmitting(true);
    try {
      const createdPattern =
        await movementPatternService.createMovementPattern(formData);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Movement pattern created successfully',
      });

      navigate(`/movement-patterns/${createdPattern.id}`);
    } catch (error) {
      console.error('Error creating movement pattern:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create movement pattern',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/movement-patterns');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button
          onClick={handleCancel}
          className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create Movement Pattern
          </h1>
          <p className="text-sm text-gray-500">
            Add a new movement pattern to the database
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <MovementPatternForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default CreateMovementPatternPage;
