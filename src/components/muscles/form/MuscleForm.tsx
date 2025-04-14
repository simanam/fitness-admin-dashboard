// src/components/muscles/form/MuscleForm.tsx
import type { FC } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Save, X } from 'lucide-react';
import type { MuscleFormData } from '../../../types/muscleFormTypes';
import { FORM_VALIDATION_RULES } from '../../../types/muscleFormTypes';
import BasicInfoSection from './BasicInfoSection';

interface MuscleFormProps {
  initialData?: MuscleFormData;
  onSubmit: (data: MuscleFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  muscleId?: string;
}

interface ValidationError {
  type: string;
  message: string;
}

type ValidationErrors = {
  [key in keyof MuscleFormData]?: ValidationError;
} & {
  root?: ValidationError;
};

const MuscleForm: FC<MuscleFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  muscleId,
}) => {
  const methods = useForm<MuscleFormData>({
    defaultValues: {
      ...initialData,
      keepExistingSvg: Boolean(muscleId),
    },
    mode: 'onChange',
    resolver: (data) => {
      // Apply validation rules using the imported FORM_VALIDATION_RULES
      try {
        const errors: ValidationErrors = {};

        for (const [field, rules] of Object.entries(FORM_VALIDATION_RULES)) {
          const value = data[field as keyof MuscleFormData];
          const fieldRules = rules as {
            required?: string;
            minLength?: { value: number; message: string };
            maxLength?: { value: number; message: string };
          };

          // Check required rule
          if (fieldRules.required && !value) {
            errors[field as keyof MuscleFormData] = {
              type: 'required',
              message: fieldRules.required || 'This field is required',
            };
            continue; // Skip other validations if required fails
          }

          // Check minLength rule
          if (
            fieldRules.minLength &&
            typeof value === 'string' &&
            value.length < fieldRules.minLength.value
          ) {
            errors[field as keyof MuscleFormData] = {
              type: 'minLength',
              message: fieldRules.minLength.message,
            };
            continue;
          }

          // Check maxLength rule
          if (
            fieldRules.maxLength &&
            typeof value === 'string' &&
            value.length > fieldRules.maxLength.value
          ) {
            errors[field as keyof MuscleFormData] = {
              type: 'maxLength',
              message: fieldRules.maxLength.message,
            };
          }
        }

        return {
          values: data,
          errors: Object.keys(errors).length > 0 ? errors : {},
        };
      } catch (validationError) {
        console.error('Validation error:', validationError);
        return {
          values: {},
          errors: {
            root: {
              type: 'validation',
              message: 'An error occurred during validation',
            },
          },
        };
      }
    },
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
