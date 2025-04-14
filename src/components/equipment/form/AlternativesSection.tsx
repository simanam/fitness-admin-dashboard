// src/components/equipment/form/AlternativesSection.tsx
import { type FC } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { FORM_SECTIONS } from '../../../types/equipmentFormTypes';

interface AlternativeOption {
  name: string;
  modification_needed: string;
  difficulty_change: number;
  limitation_notes: string;
}

interface AlternativesFormData {
  alternatives: {
    equipment_options: AlternativeOption[];
  };
}

const AlternativesSection: FC = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<AlternativesFormData>();

  // Use the useFieldArray hook to handle dynamic alternative inputs
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'alternatives.equipment_options',
  });

  // Add a new alternative
  const addAlternative = () => {
    append({
      name: '',
      modification_needed: '',
      difficulty_change: 0,
      limitation_notes: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {FORM_SECTIONS.alternatives.title}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {FORM_SECTIONS.alternatives.description}
          </p>
        </div>
        <button
          type="button"
          onClick={addAlternative}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Plus size={16} className="mr-1" />
          Add Alternative
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 border border-gray-200 border-dashed rounded-lg">
          <p className="text-gray-500">
            No alternatives added yet. Alternative equipment options help users
            find substitutes when the primary equipment is not available.
          </p>
          <button
            type="button"
            onClick={addAlternative}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
          >
            <Plus size={16} className="mr-1" />
            Add Alternative
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-900">
                  Alternative #{index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor={`alternative-name-${index}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Alternative Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id={`alternative-name-${index}`}
                    {...register(
                      `alternatives.equipment_options.${index}.name`,
                      {
                        required: 'Name is required',
                      }
                    )}
                    placeholder="e.g., Resistance Band"
                    className="mt-1"
                  />
                  {errors.alternatives?.equipment_options?.[index]?.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {
                        errors.alternatives.equipment_options[index]?.name
                          ?.message
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`alternative-modification-${index}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Modification Needed <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id={`alternative-modification-${index}`}
                    {...register(
                      `alternatives.equipment_options.${index}.modification_needed`,
                      {
                        required: 'Modification is required',
                      }
                    )}
                    placeholder="Describe how to use this alternative equipment..."
                    rows={2}
                    className="mt-1"
                  />
                  {errors.alternatives?.equipment_options?.[index]
                    ?.modification_needed && (
                    <p className="mt-1 text-sm text-red-600">
                      {
                        errors.alternatives.equipment_options[index]
                          ?.modification_needed?.message
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`difficulty-change-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Difficulty Change
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById(
                          `difficulty-change-${index}`
                        ) as HTMLInputElement;
                        const currentValue = Number.parseInt(
                          input.value || '0',
                          10
                        );
                        input.value = Math.max(-3, currentValue - 1).toString();
                        // Manually trigger change event to update the form
                        const event = new Event('input', { bubbles: true });
                        input.dispatchEvent(event);
                      }}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <Input
                      id={`difficulty-change-${index}`}
                      {...register(
                        `alternatives.equipment_options.${index}.difficulty_change`,
                        {
                          valueAsNumber: true,
                        }
                      )}
                      type="number"
                      min="-3"
                      max="3"
                      className="w-16 text-center"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById(
                          `difficulty-change-${index}`
                        ) as HTMLInputElement;
                        const currentValue = Number.parseInt(
                          input.value || '0',
                          10
                        );
                        input.value = Math.min(3, currentValue + 1).toString();
                        // Manually trigger change event to update the form
                        const event = new Event('input', { bubbles: true });
                        input.dispatchEvent(event);
                      }}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-500 ml-2">
                      <span className="flex items-center">
                        {Number(field.difficulty_change) > 0 && (
                          <ChevronUp size={16} className="text-red-500" />
                        )}
                        {Number(field.difficulty_change) < 0 && (
                          <ChevronDown size={16} className="text-green-500" />
                        )}
                        {Number(field.difficulty_change) > 0
                          ? 'Harder'
                          : Number(field.difficulty_change) < 0
                            ? 'Easier'
                            : 'Same difficulty'}
                      </span>
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Indicates if this alternative is easier (-) or harder (+)
                    than the primary equipment
                  </p>
                </div>

                <div>
                  <label
                    htmlFor={`alternative-limitations-${index}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Limitations
                  </label>
                  <Textarea
                    id={`alternative-limitations-${index}`}
                    {...register(
                      `alternatives.equipment_options.${index}.limitation_notes`
                    )}
                    placeholder="Optional: Describe any limitations of this alternative equipment..."
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlternativesSection;
