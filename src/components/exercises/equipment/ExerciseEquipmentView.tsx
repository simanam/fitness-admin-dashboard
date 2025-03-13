// src/components/exercises/equipment/ExerciseEquipmentView.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Box } from 'lucide-react';
import { EquipmentLink } from '../../../api/exerciseEquipmentService';
import EquipmentStatusBadge from './EquipmentStatusBadge';
import EquipmentAlternativesList from './EquipmentAlternativesList';

interface ExerciseEquipmentViewProps {
  equipmentLinks: EquipmentLink[];
  className?: string;
  showAlternatives?: boolean;
}

const ExerciseEquipmentView: React.FC<ExerciseEquipmentViewProps> = ({
  equipmentLinks,
  className = '',
  showAlternatives = true,
}) => {
  // Separate required and optional equipment
  const requiredEquipment = equipmentLinks.filter((link) => link.isRequired);
  const optionalEquipment = equipmentLinks.filter((link) => !link.isRequired);

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (equipmentLinks.length === 0) {
    return (
      <div
        className={`text-center py-6 bg-gray-50 rounded-lg border border-gray-200 ${className}`}
      >
        <Box className="h-8 w-8 text-gray-400 mx-auto" />
        <p className="mt-2 text-gray-500">
          No equipment specified for this exercise
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Required Equipment Section */}
      {requiredEquipment.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium uppercase text-gray-500 mb-3">
            Required Equipment
          </h4>
          <div className="space-y-4">
            {requiredEquipment.map((link) => {
              const equipment = link.equipment;
              if (!equipment) return null;

              return (
                <div
                  key={link.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        to={`/equipment/${equipment.id}`}
                        className="text-base font-medium text-gray-900 hover:text-black hover:underline"
                      >
                        {equipment.name}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-2 items-center">
                        <span className="text-xs text-gray-500">
                          {formatCategoryName(equipment.category)}
                        </span>
                        <EquipmentStatusBadge
                          isRequired={link.isRequired}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>

                  {link.setupNotes && (
                    <div className="mt-3 text-sm text-gray-700 border-t border-gray-100 pt-3">
                      {link.setupNotes}
                    </div>
                  )}

                  {showAlternatives &&
                    equipment.alternatives?.equipment_options &&
                    equipment.alternatives.equipment_options.length > 0 && (
                      <EquipmentAlternativesList equipment={equipment} />
                    )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Optional Equipment Section */}
      {optionalEquipment.length > 0 && (
        <div>
          <h4 className="text-sm font-medium uppercase text-gray-500 mb-3">
            Optional Equipment
          </h4>
          <div className="space-y-4">
            {optionalEquipment.map((link) => {
              const equipment = link.equipment;
              if (!equipment) return null;

              return (
                <div
                  key={link.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        to={`/equipment/${equipment.id}`}
                        className="text-base font-medium text-gray-900 hover:text-black hover:underline"
                      >
                        {equipment.name}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-2 items-center">
                        <span className="text-xs text-gray-500">
                          {formatCategoryName(equipment.category)}
                        </span>
                        <EquipmentStatusBadge
                          isRequired={link.isRequired}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>

                  {link.setupNotes && (
                    <div className="mt-3 text-sm text-gray-700 border-t border-gray-100 pt-3">
                      {link.setupNotes}
                    </div>
                  )}

                  {showAlternatives &&
                    equipment.alternatives?.equipment_options &&
                    equipment.alternatives.equipment_options.length > 0 && (
                      <EquipmentAlternativesList equipment={equipment} />
                    )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseEquipmentView;
