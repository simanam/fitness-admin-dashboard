// src/components/exercises/form/SafetyFormSection.tsx

import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { Plus, X, AlertTriangle, Check } from 'lucide-react';
import { Textarea } from '../../ui/textarea';
import { Select } from '../../ui/select';

interface Mistake {
  description: string;
  correction: string;
  risk_level: 'low' | 'medium' | 'high';
  id?: string;
}

interface Contraindication {
  condition: string;
  severity: 'absolute' | 'relative';
  recommendation: string;
  id?: string;
}

const SafetyFormSection: FC = () => {
  const { register, watch, setValue } = useFormContext();

  // Watch safety info fields
  const commonMistakes = watch('common_mistakes.mistakes') || [];
  const precautions = watch('safety_info.precautions') || [];
  const warningsSigns = watch('safety_info.warning_signs') || [];
  const contraindications = watch('safety_info.contraindications') || [];

  // Generate unique ID
  const generateId = () => `_${Math.random().toString(36).substr(2, 9)}`;

  // Add new item to an array
  const addItem = (field: string) => {
    const current = watch(field) || [];
    setValue(field, [
      ...current,
      field.includes('contraindications')
        ? {
            condition: '',
            severity: 'relative',
            recommendation: '',
            id: generateId(),
          }
        : { text: '', id: generateId() },
    ]);
  };

  // Remove item from array at specified index
  const removeItem = (field: string, index: number) => {
    const current = watch(field) || [];
    setValue(
      field,
      current.filter((_: unknown, i: number) => i !== index)
    );
  };

  // Add new mistake
  const addMistake = () => {
    const current = (watch('common_mistakes.mistakes') || []) as Mistake[];
    setValue('common_mistakes.mistakes', [
      ...current,
      { description: '', correction: '', risk_level: 'low', id: generateId() },
    ]);
  };

  // Remove mistake
  const removeMistake = (index: number) => {
    const current = (watch('common_mistakes.mistakes') || []) as Mistake[];
    setValue(
      'common_mistakes.mistakes',
      current.filter((_: unknown, i: number) => i !== index)
    );
  };

  return (
    <div className="space-y-8">
      {/* Common Mistakes Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Common Mistakes</h3>
          <button
            type="button"
            onClick={addMistake}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Mistake
          </button>
        </div>

        {commonMistakes.length === 0 ? (
          <div className="text-center p-4 border border-dashed border-gray-300 rounded-md">
            <p className="text-gray-500">No common mistakes added yet</p>
            <button
              type="button"
              onClick={addMistake}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              + Add common mistake
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {commonMistakes.map((mistake: Mistake) => (
              <div
                key={mistake.id || generateId()}
                className="bg-gray-50 p-4 rounded-lg relative"
              >
                <button
                  type="button"
                  onClick={() => removeMistake(commonMistakes.indexOf(mistake))}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="mb-3">
                  <label
                    htmlFor={`mistake-desc-${commonMistakes.indexOf(mistake)}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mistake Description
                  </label>
                  <Textarea
                    id={`mistake-desc-${commonMistakes.indexOf(mistake)}`}
                    {...register(
                      `common_mistakes.mistakes.${commonMistakes.indexOf(mistake)}.description`
                    )}
                    rows={2}
                    placeholder="Describe the common mistake"
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor={`mistake-correction-${commonMistakes.indexOf(mistake)}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Correction
                  </label>
                  <Textarea
                    id={`mistake-correction-${commonMistakes.indexOf(mistake)}`}
                    {...register(
                      `common_mistakes.mistakes.${commonMistakes.indexOf(mistake)}.correction`
                    )}
                    rows={2}
                    placeholder="How to correct this mistake"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`mistake-risk-${commonMistakes.indexOf(mistake)}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Risk Level
                  </label>
                  <Select
                    id={`mistake-risk-${commonMistakes.indexOf(mistake)}`}
                    {...register(
                      `common_mistakes.mistakes.${commonMistakes.indexOf(mistake)}.risk_level`
                    )}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safety Info Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Safety Information
        </h3>

        <div className="mb-4">
          <label
            htmlFor="safety-risk-level"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Risk Level
          </label>
          <Select
            id="safety-risk-level"
            {...register('safety_info.risk_level')}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>

        {/* Contraindications */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-md font-medium text-gray-800 flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
              Contraindications
            </h4>
            <button
              type="button"
              onClick={() => addItem('safety_info.contraindications')}
              className="inline-flex items-center px-2 py-1 text-xs border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </button>
          </div>

          {contraindications.length === 0 ? (
            <div className="text-center p-3 border border-dashed border-gray-300 rounded-md">
              <p className="text-sm text-gray-500">
                No contraindications added
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {contraindications.map((item: Contraindication) => (
                <div
                  key={item.id || generateId()}
                  className="bg-gray-50 p-3 rounded-lg relative"
                >
                  <button
                    type="button"
                    onClick={() =>
                      removeItem(
                        'safety_info.contraindications',
                        contraindications.indexOf(item)
                      )
                    }
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="mb-2">
                    <label
                      htmlFor={`contraindication-condition-${contraindications.indexOf(item)}`}
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Condition
                    </label>
                    <Textarea
                      id={`contraindication-condition-${contraindications.indexOf(item)}`}
                      {...register(
                        `safety_info.contraindications.${contraindications.indexOf(item)}.condition`
                      )}
                      rows={1}
                      placeholder="Medical condition or situation"
                    />
                  </div>

                  <div className="mb-2">
                    <label
                      htmlFor={`contraindication-severity-${contraindications.indexOf(item)}`}
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Severity
                    </label>
                    <Select
                      id={`contraindication-severity-${contraindications.indexOf(item)}`}
                      {...register(
                        `safety_info.contraindications.${contraindications.indexOf(item)}.severity`
                      )}
                    >
                      <option value="absolute">Absolute</option>
                      <option value="relative">Relative</option>
                    </Select>
                  </div>

                  <div>
                    <label
                      htmlFor={`contraindication-recommendation-${contraindications.indexOf(item)}`}
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Recommendation
                    </label>
                    <Textarea
                      id={`contraindication-recommendation-${contraindications.indexOf(item)}`}
                      {...register(
                        `safety_info.contraindications.${contraindications.indexOf(item)}.recommendation`
                      )}
                      rows={1}
                      placeholder="What to recommend for this condition"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Precautions */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-md font-medium text-gray-800 flex items-center">
              <Check className="h-4 w-4 text-blue-500 mr-1" />
              Precautions
            </h4>
            <button
              type="button"
              onClick={() => addItem('safety_info.precautions')}
              className="inline-flex items-center px-2 py-1 text-xs border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </button>
          </div>

          {precautions.length === 0 ? (
            <div className="text-center p-3 border border-dashed border-gray-300 rounded-md">
              <p className="text-sm text-gray-500">No precautions added</p>
            </div>
          ) : (
            <div className="space-y-2">
              {precautions.map((precaution: { text: string; id: string }) => (
                <div key={precaution.id} className="flex items-start">
                  <div className="flex-grow">
                    <Textarea
                      {...register(
                        `safety_info.precautions.${precautions.indexOf(precaution)}`
                      )}
                      rows={1}
                      placeholder="Safety precaution"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      removeItem(
                        'safety_info.precautions',
                        precautions.indexOf(precaution)
                      )
                    }
                    className="ml-2 mt-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warning Signs */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-md font-medium text-gray-800 flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
              Warning Signs
            </h4>
            <button
              type="button"
              onClick={() => addItem('safety_info.warning_signs')}
              className="inline-flex items-center px-2 py-1 text-xs border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </button>
          </div>

          {warningsSigns.length === 0 ? (
            <div className="text-center p-3 border border-dashed border-gray-300 rounded-md">
              <p className="text-sm text-gray-500">No warning signs added</p>
            </div>
          ) : (
            <div className="space-y-2">
              {warningsSigns.map((warning: { text: string; id: string }) => (
                <div key={warning.id} className="flex items-start">
                  <div className="flex-grow">
                    <Textarea
                      {...register(
                        `safety_info.warning_signs.${warningsSigns.indexOf(warning)}`
                      )}
                      rows={1}
                      placeholder="Warning sign to watch for"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      removeItem(
                        'safety_info.warning_signs',
                        warningsSigns.indexOf(warning)
                      )
                    }
                    className="ml-2 mt-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafetyFormSection;
