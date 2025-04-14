// src/pages/exercises/tabs/ExerciseEquipment.tsx
import { Info } from 'lucide-react';
import { useExerciseEquipment } from '../../../hooks/useExerciseEquipment';
import ExerciseEquipmentManager from '../../../components/exercises/equipment/ExerciseEquipmentManager';

interface ExerciseEquipmentProps {
  exerciseId: string;
}

const ExerciseEquipment = ({ exerciseId }: ExerciseEquipmentProps) => {
  const { equipmentLinks, isLoading, stats } = useExerciseEquipment({
    exerciseId,
  });

  return (
    <div className="space-y-6">
      {/* Equipment statistics */}
      {!isLoading && equipmentLinks.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px]">
              <div className="text-sm text-gray-500">Total Equipment</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.total}
              </div>
            </div>

            <div className="flex-1 min-w-[150px]">
              <div className="text-sm text-gray-500">Required</div>
              <div className="text-2xl font-bold text-red-600">
                {stats.required}
              </div>
            </div>

            <div className="flex-1 min-w-[150px]">
              <div className="text-sm text-gray-500">Optional</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.optional}
              </div>
            </div>
          </div>

          {stats.required === 0 && equipmentLinks.length > 0 && (
            <div className="mt-3 flex items-start bg-blue-50 text-blue-800 p-3 rounded-md">
              <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                This exercise doesn't have any required equipment. Consider
                marking essential equipment as required to help users understand
                what they need.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Equipment manager component */}
      <ExerciseEquipmentManager exerciseId={exerciseId} />
    </div>
  );
};

export default ExerciseEquipment;
