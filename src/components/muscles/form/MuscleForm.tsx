// src/components/muscles/form/MuscleForm.tsx
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Save, X } from 'lucide-react';
import {
  MuscleFormData,
  FORM_VALIDATION_RULES,
} from '../../../types/muscleFormTypes';
import BasicInfoSection from './BasicInfoSection';

interface MuscleFormProps {
  initialData?: MuscleFormData;
  onSubmit: (data: MuscleFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  muscleId?: string;
}

const MuscleForm: React.FC<MuscleFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  muscleId,
}) => {
  const methods = useForm<MuscleFormData>({
    defaultValues: {
      ...initialData,
      keepExistingSvg: muscleId ? true : false,
    },
    mode: 'onChange',
    rules: FORM_VALIDATION_RULES,
  });

  const {
    handleSubmit,
    formState: { isDirty, isValid },
  } = methods;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Form content */}
        <BasicInfoSection muscleId={muscleId} />

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </button>

          <button
            type="submit"
            disabled={!isDirty || !isValid || isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-1" />
            {isSubmitting ? 'Saving...' : 'Save Muscle'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

export default MuscleForm;
