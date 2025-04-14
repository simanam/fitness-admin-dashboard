// src/types/muscleFormTypes.ts

export interface MuscleFormData {
  name: string;
  commonName?: string;
  description?: string;
  muscleGroupId: string;
  svgFile?: File;
  keepExistingSvg?: boolean;
}

export const defaultMuscleFormData: MuscleFormData = {
  name: '',
  commonName: '',
  description: '',
  muscleGroupId: '',
  keepExistingSvg: true,
};

export const FORM_VALIDATION_RULES = {
  name: {
    required: 'Name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
    maxLength: { value: 100, message: 'Name must be less than 100 characters' },
  },
  commonName: {
    maxLength: {
      value: 50,
      message: 'Common name must be less than 50 characters',
    },
  },
  description: {
    maxLength: {
      value: 1000,
      message: 'Description must be less than 1000 characters',
    },
  },
  muscleGroupId: {
    required: 'Muscle group is required',
  },
};

export const FORM_SECTIONS = {
  basic: {
    title: 'Basic Information',
    description: 'Enter the basic details about the muscle.',
  },
};
