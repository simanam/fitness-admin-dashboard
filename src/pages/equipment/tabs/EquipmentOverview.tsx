// src/pages/equipment/tabs/EquipmentOverview.tsx
import { type FC } from 'react';
import { Info, Calendar, Box, Check, X, AlertCircle } from 'lucide-react';
import type { Equipment } from '../../../api/equipmentService';

// Extend the Equipment type to include the missing properties
interface ExtendedEquipment extends Equipment {
  usage_tips?: string;
  safety_considerations?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EquipmentOverviewProps {
  equipment: ExtendedEquipment;
  setEquipment: React.Dispatch<React.SetStateAction<ExtendedEquipment | null>>;
}

const EquipmentOverview: FC<EquipmentOverviewProps> = ({ equipment }) => {
  // Format the date in a readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Info className="h-5 w-5 mr-2 text-gray-500" />
          Description
        </h3>
        {equipment.description ? (
          <div className="prose max-w-none">
            <p className="text-gray-700">{equipment.description}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">No description provided.</p>
        )}
      </div>

      {/* Technical Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Box className="h-5 w-5 mr-2 text-gray-500" />
          Equipment Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
            <p className="text-gray-900">
              {formatCategoryName(equipment.category)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Common Equipment
            </h4>
            <p className="text-gray-900 flex items-center">
              {equipment.isCommon ? (
                <>
                  <Check className="h-4 w-4 text-green-500 mr-1" /> Yes
                </>
              ) : (
                <>
                  <X className="h-4 w-4 text-gray-400 mr-1" /> No
                </>
              )}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Alternative Options
            </h4>
            <p className="text-gray-900">
              {equipment.alternatives?.equipment_options?.length || 0}{' '}
              alternatives available
            </p>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      {equipment.usage_tips && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <Info className="h-5 w-5 mr-2 text-gray-500" />
            Usage Tips
          </h3>
          <div className="prose max-w-none">
            <p className="text-gray-700">{equipment.usage_tips}</p>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-gray-500" />
          Metadata
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Created</p>
              <p className="text-gray-900">{formatDate(equipment.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-gray-900">{formatDate(equipment.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Considerations */}
      {equipment.safety_considerations && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-gray-500" />
            Safety Considerations
          </h3>
          <div className="prose max-w-none bg-red-50 p-4 rounded-lg border border-red-100">
            <p className="text-gray-700">{equipment.safety_considerations}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentOverview;
