import { z } from 'zod';

export interface MuscleFormData {
  name: string;
  commonName?: string;
  description?: string;
  muscleGroupId: string;
  svgFile?: File;
}

export const defaultMuscleFormData: MuscleFormData = {
  name: '',
  commonName: '',
  description: '',
  muscleGroupId: '',
  svgUrl: '',
};

export const FORM_VALIDATION_RULES = {
  name: {
    required: 'Name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
    maxLength: { value: 100, message: 'Name must be less than 100 characters' },
    pattern: {
      value: /^[A-Za-z\s-]+$/,
      message: 'Name must contain only letters, spaces, and hyphens',
    },
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
