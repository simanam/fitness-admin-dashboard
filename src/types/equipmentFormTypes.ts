// src/types/equipmentFormTypes.ts

export type EquipmentCategory =
  | 'FREE_WEIGHTS'
  | 'MACHINES'
  | 'CABLES'
  | 'BODYWEIGHT'
  | 'CARDIO'
  | 'ACCESSORIES'
  | 'OTHER';

export interface EquipmentAlternativeFormData {
  name: string;
  modification_needed: string;
  difficulty_change: number;
  limitation_notes?: string;
}

export interface EquipmentFormData {
  name: string;
  description: string;
  category: EquipmentCategory;
  isCommon: boolean;
  alternatives?: {
    equipment_options: EquipmentAlternativeFormData[];
  };
}

export const defaultEquipmentFormData: EquipmentFormData = {
  name: '',
  description: '',
  category: 'FREE_WEIGHTS',
  isCommon: true,
  alternatives: {
    equipment_options: [],
  },
};

export const FORM_VALIDATION_RULES = {
  name: {
    required: 'Equipment name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
    maxLength: { value: 100, message: 'Name must be less than 100 characters' },
  },
  category: {
    required: 'Category is required',
  },
  description: {
    maxLength: {
      value: 1000,
      message: 'Description must be less than 1000 characters',
    },
  },
};

export const FORM_SECTIONS = {
  basic: {
    title: 'Basic Information',
    description: 'Enter the basic details about the equipment',
  },
  alternatives: {
    title: 'Alternative Options',
    description: 'Define equivalent equipment that can be used as alternatives',
  },
};

export const CATEGORY_OPTIONS = [
  { value: 'FREE_WEIGHTS', label: 'Free Weights' },
  { value: 'MACHINES', label: 'Machines' },
  { value: 'CABLES', label: 'Cables' },
  { value: 'BODYWEIGHT', label: 'Bodyweight' },
  { value: 'CARDIO', label: 'Cardio Equipment' },
  { value: 'ACCESSORIES', label: 'Accessories' },
  { value: 'OTHER', label: 'Other' },
];
