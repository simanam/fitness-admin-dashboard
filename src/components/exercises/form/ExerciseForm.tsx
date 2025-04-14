// src/components/exercises/form/ExerciseForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { ChevronRight, Save, X } from 'lucide-react';
import {
  ExerciseFormData,
  FORM_SECTIONS,
  defaultExerciseFormData,
} from '../../../types/exerciseFormTypes';
import BasicInfoSection from './BasicInfoSection';
import TechnicalDetailsSection from './TechnicalDetailsSection';
import InstructionsSection from './InstructionsSection';
import SafetyFormSection from './SafetyFormSection';
import MediaUploadSection from './MediaUploadSection';
import { parseInstructions } from '../../../utils/instructionsParser';

interface ExerciseFormProps {
  initialData?: ExerciseFormData;
  exerciseId?: string;
  onSubmit: (data: ExerciseFormData, mediaFiles?: File[]) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({
  initialData,

  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [activeSection, setActiveSection] = useState(0);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaMetadata, setMediaMetadata] = useState<any[]>([]);

  // Ensure all nested objects are properly initialized
  const preparedInitialData: ExerciseFormData = initialData
    ? {
        ...initialData,
        // Ensure form_points structure is complete
        form_points: {
          setup: initialData.form_points?.setup || [],
          execution: initialData.form_points?.execution || [],
          breathing: initialData.form_points?.breathing || [],
          alignment: initialData.form_points?.alignment || [],
        },
        // Ensure common_mistakes structure is complete
        common_mistakes: {
          mistakes: initialData.common_mistakes?.mistakes || [],
        },
        // Ensure safety_info structure is complete
        safety_info: {
          risk_level: initialData.safety_info?.risk_level || 'low',
          precautions: initialData.safety_info?.precautions || [],
          warning_signs: initialData.safety_info?.warning_signs || [],
          contraindications: initialData.safety_info?.contraindications || [],
        },
        // Ensure tempo_recommendations structure is complete
        tempo_recommendations: {
          default: initialData.tempo_recommendations?.default || '',
          tempo_notes: initialData.tempo_recommendations?.tempo_notes || '',
        },
      }
    : defaultExerciseFormData;

  const methods = useForm<ExerciseFormData>({
    defaultValues: preparedInitialData,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isDirty, isValid, errors },
    getValues,
    reset,
  } = methods;

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      reset(preparedInitialData);
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data: ExerciseFormData) => {
    // Update form_points from instructions if they exist
    if (data.instructions) {
      const parsedFormPoints = parseInstructions(data.instructions);
      data.form_points = parsedFormPoints;
    }

    // Ensure all required nested objects exist
    if (!data.form_points) {
      data.form_points = {
        setup: [],
        execution: [],
        breathing: [],
        alignment: [],
      };
    }

    if (!data.common_mistakes) {
      data.common_mistakes = { mistakes: [] };
    }

    if (!data.safety_info) {
      data.safety_info = {
        risk_level: 'low',
        precautions: [],
        warning_signs: [],
        contraindications: [],
      };
    }

    if (!data.tempo_recommendations) {
      data.tempo_recommendations = {
        default: '',
        tempo_notes: '',
      };
    }

    // Pass data and media files to the parent onSubmit
    onSubmit(data, mediaFiles.length > 0 ? mediaFiles : undefined);
  };

  const handleAddMedia = (file: File, metadata: any) => {
    setMediaFiles([...mediaFiles, file]);
    setMediaMetadata([...mediaMetadata, metadata]);
  };

  const handleRemoveMedia = (index: number) => {
    const newFiles = [...mediaFiles];
    const newMetadata = [...mediaMetadata];
    newFiles.splice(index, 1);
    newMetadata.splice(index, 1);
    setMediaFiles(newFiles);
    setMediaMetadata(newMetadata);
  };

  const sections = [
    {
      id: 'basic',
      title: FORM_SECTIONS.basic.title,
      component: <BasicInfoSection />,
    },
    {
      id: 'technical',
      title: FORM_SECTIONS.technical.title,
      component: <TechnicalDetailsSection />,
    },
    {
      id: 'instructions',
      title: FORM_SECTIONS.instructions.title,
      component: <InstructionsSection />,
    },
    {
      id: 'safety',
      title: FORM_SECTIONS.safety.title,
      component: <SafetyFormSection />,
    },
    {
      id: 'media',
      title: FORM_SECTIONS.media.title,
      component: (
        <MediaUploadSection
          onAddMedia={handleAddMedia}
          onRemoveMedia={handleRemoveMedia}
          mediaFiles={mediaFiles}
        />
      ),
    },
  ];

  const handleNext = () => {
    if (activeSection < sections.length - 1) {
      setActiveSection((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (activeSection > 0) {
      setActiveSection((prev) => prev - 1);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Progress steps */}
        <div className="border-b border-gray-200 pb-4">
          <nav className="flex flex-wrap justify-between">
            {sections.map((section, index) => (
              <React.Fragment key={section.id}>
                <button
                  type="button"
                  onClick={() => setActiveSection(index)}
                  className={`flex items-center mb-2 ${
                    index === activeSection
                      ? 'text-black'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span
                    className={`
                    w-8 h-8 flex items-center justify-center rounded-full border-2
                    ${index <= activeSection ? 'border-black bg-black text-white' : 'border-gray-300'}
                  `}
                  >
                    {index + 1}
                  </span>
                  <span className="ml-2 font-medium text-sm">
                    {section.title}
                  </span>
                </button>
                {index < sections.length - 1 && (
                  <ChevronRight className="h-5 w-5 text-gray-400 mx-2 hidden md:block" />
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Active section */}
        <div className="min-h-[400px]">{sections[activeSection].component}</div>

        {/* Navigation and action buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div>
            {activeSection > 0 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Previous
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </button>

            {activeSection < sections.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-1" />
                {isSubmitting ? 'Saving...' : 'Save Exercise'}
              </button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default ExerciseForm;
