// src/pages/movement-patterns/EditMovementPatternPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import movementPatternService, {
  MovementPattern,
} from '../../api/movementPatternService';
import MovementPatternForm from '../../components/movement-patterns/MovementPatternForm';

const EditMovementPatternPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [pattern, setPattern] = useState<MovementPattern | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPattern = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const patternData = await movementPatternService.getMovementPattern(id);
        setPattern(patternData);
      } catch (error) {
        console.error('Error fetching movement pattern:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load movement pattern data',
        });
        navigate('/movement-patterns');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPattern();
  }, [id, navigate, showToast]);

  const handleSubmit = async (formData: {
    name: string;
    patternType: string;
    category: string;
    description: string;
  }) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await movementPatternService.updateMovementPattern(id, formData);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Movement pattern updated successfully',
      });

      navigate(`/movement-patterns/${id}`);
    } catch (error) {
      console.error('Error updating movement pattern:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update movement pattern',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/movement-patterns/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!pattern) {
    return null;
  }

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
            Edit Movement Pattern
          </h1>
          <p className="text-sm text-gray-500">{pattern.name}</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <MovementPatternForm
          initialData={{
            name: pattern.name,
            patternType: pattern.patternType,
            category: pattern.category,
            description: pattern.description || '',
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default EditMovementPatternPage;
