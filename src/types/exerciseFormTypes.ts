// src/types/exerciseFormTypes.ts

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type MovementPattern =
  | 'squat'
  | 'hinge'
  | 'push'
  | 'pull'
  | 'carry'
  | 'rotation'
  | 'lunge'
  | 'core';

export type Mechanics = 'compound' | 'isolation';

export type Force = 'push' | 'pull';

export type PlaneOfMotion =
  | 'sagittal'
  | 'frontal'
  | 'transverse'
  | 'multi-planar';

export type ExerciseStatus = 'draft' | 'published' | 'archived';

export interface ExerciseFormData {
  name: string;
  description: string;
  difficulty: ExerciseDifficulty;
  movement_pattern: MovementPattern;
  mechanics: Mechanics;
  force: Force;
  equipment_required: boolean;
  bilateral: boolean;
  plane_of_motion: PlaneOfMotion;
  status: ExerciseStatus;
  instructions?: string;
}

export const defaultExerciseFormData: ExerciseFormData = {
  name: '',
  description: '',
  difficulty: 'beginner',
  movement_pattern: 'squat',
  mechanics: 'compound',
  force: 'push',
  equipment_required: false,
  bilateral: true,
  plane_of_motion: 'sagittal',
  status: 'draft',
  instructions: '',
};

export const FORM_VALIDATION_RULES = {
  name: {
    required: 'Exercise name is required',
    minLength: { value: 3, message: 'Name must be at least 3 characters' },
    maxLength: { value: 100, message: 'Name must be less than 100 characters' },
  },
  description: {
    required: 'Description is required',
    minLength: {
      value: 10,
      message: 'Description must be at least 10 characters',
    },
  },
  difficulty: {
    required: 'Difficulty level is required',
  },
  movement_pattern: {
    required: 'Movement pattern is required',
  },
  mechanics: {
    required: 'Exercise mechanics is required',
  },
  force: {
    required: 'Force type is required',
  },
  plane_of_motion: {
    required: 'Plane of motion is required',
  },
};

export const FORM_SECTIONS = {
  basic: {
    title: 'Basic Information',
    description: 'Enter the basic details of the exercise',
  },
  technical: {
    title: 'Technical Details',
    description: 'Specify the technical aspects of the exercise',
  },
  instructions: {
    title: 'Instructions',
    description: 'Provide detailed instructions for performing the exercise',
  },
  media: {
    title: 'Media',
    description: 'Upload images and videos that demonstrate the exercise',
  },
};
