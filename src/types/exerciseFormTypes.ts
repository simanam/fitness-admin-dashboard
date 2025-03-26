// src/types/exerciseFormTypes.ts

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type MovementPattern =
  | 'push'
  | 'pull'
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'carry'
  | 'rotation'
  | 'gait';

export type Mechanics = 'compound' | 'isolation';

export type Force = 'push' | 'pull' | 'carry' | 'static';

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
  setup_position?: string;
  form_points?: {
    setup: string[];
    execution: string[];
    breathing: string[];
    alignment: string[];
  };
  common_mistakes?: {
    mistakes: Array<{
      description: string;
      correction: string;
      risk_level: 'low' | 'medium' | 'high';
    }>;
  };
  safety_info?: {
    risk_level: 'low' | 'medium' | 'high';
    contraindications: Array<{
      condition: string;
      severity: 'absolute' | 'relative';
      recommendation: string;
    }>;
    precautions: string[];
    warning_signs: string[];
  };
  tempo_recommendations?: {
    default: string;
    variations?: Array<{
      tempo: string;
      purpose: string;
      difficulty: string;
    }>;
    tempo_notes?: string;
  };
}

export const defaultExerciseFormData: ExerciseFormData = {
  name: '',
  description: '',
  difficulty: 'beginner',
  movement_pattern: 'push',
  mechanics: 'compound',
  force: 'push',
  equipment_required: false,
  bilateral: true,
  plane_of_motion: 'sagittal',
  status: 'draft',
  setup_position: '',
  form_points: {
    setup: [],
    execution: [],
    breathing: [],
    alignment: [],
  },
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
  safety: {
    title: 'Safety & Form',
    description: 'Add safety information and form guidelines',
  },
  media: {
    title: 'Media',
    description: 'Upload images and videos that demonstrate the exercise',
  },
};
