// src/components/joints/MovementTypes.ts

// Define the structure for a movement
export interface Motion {
  name: string;
  plane: 'sagittal' | 'frontal' | 'transverse' | 'multi-planar';
  range: {
    min: number;
    max: number;
    units: string;
  };
  description?: string;
}

// Define available planes of motion
export const PLANES_OF_MOTION = [
  { value: 'sagittal', label: 'Sagittal (Forward/Backward)' },
  { value: 'frontal', label: 'Frontal (Side to Side)' },
  { value: 'transverse', label: 'Transverse (Rotational)' },
  { value: 'multi-planar', label: 'Multi-planar' },
];

// Define common movement names
export const COMMON_MOVEMENTS = [
  { value: 'flexion', label: 'Flexion' },
  { value: 'extension', label: 'Extension' },
  { value: 'abduction', label: 'Abduction' },
  { value: 'adduction', label: 'Adduction' },
  { value: 'rotation', label: 'Rotation' },
  { value: 'internal_rotation', label: 'Internal Rotation' },
  { value: 'external_rotation', label: 'External Rotation' },
  { value: 'lateral_flexion', label: 'Lateral Flexion' },
  { value: 'circumduction', label: 'Circumduction' },
  { value: 'protraction', label: 'Protraction' },
  { value: 'retraction', label: 'Retraction' },
  { value: 'elevation', label: 'Elevation' },
  { value: 'depression', label: 'Depression' },
  { value: 'inversion', label: 'Inversion' },
  { value: 'eversion', label: 'Eversion' },
  { value: 'pronation', label: 'Pronation' },
  { value: 'supination', label: 'Supination' },
  { value: 'dorsiflexion', label: 'Dorsiflexion' },
  { value: 'plantarflexion', label: 'Plantarflexion' },
  { value: 'opposition', label: 'Opposition' },
];

// Helper function to get color based on the movement plane
export const getPlaneColor = (plane: string) => {
  switch (plane) {
    case 'sagittal':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'frontal':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'transverse':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'multi-planar':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Helper function to get range categorization
export const getRangeCategory = (min: number, max: number) => {
  const range = max - min;
  if (range > 150) return 'extensive';
  if (range > 100) return 'large';
  if (range > 60) return 'moderate';
  if (range > 30) return 'small';
  return 'limited';
};

// Helper function to get range color based on category
export const getRangeCategoryColor = (category: string) => {
  switch (category) {
    case 'extensive':
      return 'bg-green-100 border-green-200';
    case 'large':
      return 'bg-green-50 border-green-100';
    case 'moderate':
      return 'bg-blue-50 border-blue-100';
    case 'small':
      return 'bg-yellow-50 border-yellow-100';
    case 'limited':
      return 'bg-red-50 border-red-100';
    default:
      return 'bg-gray-50 border-gray-100';
  }
};
