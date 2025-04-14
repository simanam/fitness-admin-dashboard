// src/components/equipment/form/EquipmentForm.tsx
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { ChevronRight, Save, X } from 'lucide-react';
import { EquipmentFormData } from '../../../types/equipmentFormTypes';
import BasicInfoSection from './BasicInfoSection';
import AlternativesSection from './AlternativesSection';

interface EquipmentFormProps {
  initialData?: EquipmentFormData;
  onSubmit: (data: EquipmentFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [activeSection, setActiveSection] = useState(0);

  const methods = useForm<EquipmentFormData>({
    defaultValues: initialData,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isDirty, isValid },
  } = methods;

  const sections = [
    {
      id: 'basic',
      title: 'Basic Information',
      component: <BasicInfoSection />,
    },
    {
      id: 'alternatives',
      title: 'Alternatives',
      component: <AlternativesSection />,
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Progress steps */}
        <div className="border-b border-gray-200 pb-4">
          <nav className="flex justify-between">
            {sections.map((section, index) => (
              <React.Fragment key={section.id}>
                <button
                  type="button"
                  onClick={() => setActiveSection(index)}
                  className={`flex items-center ${
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
                  <ChevronRight className="h-5 w-5 text-gray-400 mx-2" />
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
                disabled={!isDirty || !isValid || isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-1" />
                {isSubmitting ? 'Saving...' : 'Save Equipment'}
              </button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default EquipmentForm;
