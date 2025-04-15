// src/pages/exercises/EditExercisePage.tsx
import { useEffect, useState, type FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ExerciseForm from '../../components/exercises/form/ExerciseForm';
import { useExerciseForm } from '../../hooks/useExerciseForm';
import { useToast } from '../../hooks/useToast';
import exerciseService from '../../api/exerciseService';
import type {
  ExerciseFormData,
  MovementPattern,
  PlaneOfMotion,
} from '../../types/exerciseFormTypes';
import { formatInstructions } from '../../utils/instructionsParser';

// Define missing interfaces locally since they're not exported
interface Contraindication {
  condition: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

interface TempoRecommendations {
  default: string;
  tempo_notes: string;
}

const EditExercisePage: FC = () => {
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
          movement_pattern: exercise.movement_pattern as MovementPattern,
          mechanics: exercise.mechanics,
          force: exercise.force,
          equipment_required: exercise.equipment_required,
          bilateral: exercise.bilateral,
          plane_of_motion: exercise.plane_of_motion as PlaneOfMotion,
          status: exercise.status,

          // Handle form_points
          form_points: {
            setup: exercise.form_points?.setup || [],
            execution: exercise.form_points?.execution || [],
            breathing: exercise.form_points?.breathing || [],
            alignment: exercise.form_points?.alignment || [],
          },

          // Generate instructions from form_points if they don't exist
          instructions:
            exercise.instructions ||
            formatInstructions({
              setup: exercise.form_points?.setup || [],
              execution: exercise.form_points?.execution || [],
              breathing: exercise.form_points?.breathing || [],
              alignment: exercise.form_points?.alignment || [],
            }),

          // Handle common mistakes
          common_mistakes: {
            mistakes: exercise.common_mistakes?.mistakes || [],
          },

          // Handle safety info with proper defaults
          safety_info: {
            risk_level: exercise.safety_info?.risk_level || 'low',
            precautions: exercise.safety_info?.precautions || [],
            warning_signs: exercise.safety_info?.warning_signs || [],
            contraindications: (
              exercise.safety_info?.contraindications || []
            ).map((item): Contraindication => {
              if (typeof item === 'string') {
                return {
                  condition: item,
                  severity: 'medium',
                  recommendation: 'Consult a healthcare professional',
                };
              }
              return item as Contraindication;
            }),
          },

          // Handle tempo recommendations
          tempo_recommendations: {
            default:
              (exercise.tempo_recommendations as TempoRecommendations)
                ?.default || '',
            tempo_notes:
              (exercise.tempo_recommendations as TempoRecommendations)
                ?.tempo_notes || '',
          },
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
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
          type="button"
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
