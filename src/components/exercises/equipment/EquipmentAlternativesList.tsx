// src/components/exercises/equipment/EquipmentAlternativesList.tsx
import { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { Equipment, EquipmentAlternative } from '../../../api/equipmentService';

interface EquipmentAlternativesListProps {
  equipment: Equipment;
}

const EquipmentAlternativesList: React.FC<EquipmentAlternativesListProps> = ({
  equipment,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get alternatives array safely
  const alternatives = equipment.alternatives?.equipment_options || [];

  // If no alternatives, return null
  if (alternatives.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 mr-1" />
        ) : (
          <ChevronDown className="h-4 w-4 mr-1" />
        )}
        <span>Alternatives ({alternatives.length})</span>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2">
          {alternatives.map((alternative, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-3 text-sm bg-gray-50"
            >
              <div className="font-medium flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-400 mr-1" />
                {alternative.name}
              </div>

              <div className="mt-2 text-gray-700 ml-5 space-y-1">
                <p>
                  <span className="text-gray-500">Modification: </span>
                  {alternative.modification_needed}
                </p>

                <div className="flex items-center">
                  <span className="text-gray-500 mr-1">
                    Difficulty change:{' '}
                  </span>
                  <div
                    className={`flex items-center ${
                      alternative.difficulty_change > 0
                        ? 'text-red-600'
                        : alternative.difficulty_change < 0
                          ? 'text-green-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {alternative.difficulty_change > 0 ? (
                      <ChevronUp className="h-4 w-4 mr-1" />
                    ) : alternative.difficulty_change < 0 ? (
                      <ChevronDown className="h-4 w-4 mr-1" />
                    ) : null}
                    {alternative.difficulty_change > 0 ? '+' : ''}
                    {alternative.difficulty_change}
                  </div>
                </div>

                {alternative.limitation_notes && (
                  <p>
                    <span className="text-gray-500">Limitations: </span>
                    {alternative.limitation_notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentAlternativesList;
