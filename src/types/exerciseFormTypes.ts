// src/types/exerciseFormTypes.ts

export type ExerciseDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type MovementPattern =
  | 'SQUAT'
  | 'HINGE'
  | 'PUSH'
  | 'PULL'
  | 'CARRY'
  | 'ROTATION'
  | 'LUNGE'
  | 'CORE';

export type Mechanics = 'COMPOUND' | 'ISOLATION';

export type Force = 'PUSH' | 'PULL';

export type PlaneOfMotion = 'SAGITTAL' | 'FRONTAL' | 'TRANSVERSE';

export type ExerciseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

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
  difficulty: 'BEGINNER',
  movement_pattern: 'SQUAT',
  mechanics: 'COMPOUND',
  force: 'PUSH',
  equipment_required: false,
  bilateral: true,
  plane_of_motion: 'SAGITTAL',
  status: 'DRAFT',
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
