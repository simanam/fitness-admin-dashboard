// src/components/joints/JointForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import jointService, { Joint } from '../../api/jointService';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';
import ConfirmationDialog from '../ui/confirmation-dialog';
import MobilityRangeInput from './MobilityRangeInput';
import MovementInput from './MovementInput';

interface JointFormProps {
  jointId?: string;
  initialData?: Partial<Joint>;
  onSuccess?: (jointId: string) => void;
}

interface FormData {
  name: string;
  type: string;
  description: string;
  mobilityRange: Record<string, any>;
  movements: {
    primary: Array<{
      name: string;
      plane: string;
      range: {
        min: number;
        max: number;
        units: string;
      };
    }>;
    accessory: string[];
  };
}

interface FormErrors {
  name?: string;
  type?: string;
  movements?: string;
  mobilityRange?: string;
  [key: string]: string | undefined;
}

const JointForm: React.FC<JointFormProps> = ({
  jointId,
  initialData,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditMode = !!jointId;

  // Default form data
  const defaultFormData: FormData = {
    name: '',
    type: 'hinge',
    description: '',
    mobilityRange: {},
    movements: {
      primary: [],
      accessory: [],
    },
  };

  // Form state
  const [formData, setFormData] = useState<FormData>(
    initialData ? { ...defaultFormData, ...initialData } : defaultFormData
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

  // Available joint types
  const jointTypes = [
    { value: 'ball_and_socket', label: 'Ball and Socket' },
    { value: 'hinge', label: 'Hinge' },
    { value: 'pivot', label: 'Pivot' },
    { value: 'ellipsoidal', label: 'Ellipsoidal' },
    { value: 'saddle', label: 'Saddle' },
    { value: 'gliding', label: 'Gliding' },
    { value: 'other', label: 'Other' },
  ];

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormTouched(true);

    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Update mobility range section of the form
  const handleMobilityRangeChange = (mobilityRange: Record<string, any>) => {
    setFormData((prev) => ({ ...prev, mobilityRange }));
    setFormTouched(true);

    // Clear error if it exists
    if (errors.mobilityRange) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.mobilityRange;
        return newErrors;
      });
    }
  };

  // Update movements section of the form
  const handleMovementsChange = (movements: {
    primary: Array<{
      name: string;
      plane: string;
      range: {
        min: number;
        max: number;
        units: string;
      };
    }>;
    accessory: string[];
  }) => {
    setFormData((prev) => ({ ...prev, movements }));
    setFormTouched(true);

    // Clear error if it exists
    if (errors.movements) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.movements;
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Joint name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (!formData.type) {
      newErrors.type = 'Joint type is required';
    }

    // Check if at least one movement is defined
    if (
      formData.movements.primary.length === 0 &&
      formData.movements.accessory.length === 0
    ) {
      newErrors.movements = 'At least one movement must be defined';
    }

    // Check if mobility range is defined
    if (Object.keys(formData.mobilityRange).length === 0) {
      newErrors.mobilityRange = 'At least one mobility range must be defined';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please correct the errors in the form',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isEditMode) {
        // Update existing joint
        await jointService.updateJoint(jointId, formData);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Joint updated successfully',
        });
        if (onSuccess) {
          onSuccess(jointId);
        } else {
          navigate(`/joints/${jointId}`);
        }
      } else {
        // Create new joint
        const newJoint = await jointService.createJoint(formData);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Joint created successfully',
        });
        if (onSuccess) {
          onSuccess(newJoint.id);
        } else {
          navigate(`/joints/${newJoint.id}`);
        }
      }
    } catch (error) {
      console.error('Error saving joint:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: `Failed to ${isEditMode ? 'update' : 'create'} joint`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (formTouched) {
      setShowCancelDialog(true);
    } else {
      navigateBack();
    }
  };

  const navigateBack = () => {
    if (isEditMode) {
      navigate(`/joints/${jointId}`);
    } else {
      navigate('/joints');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="space-y-4">
            <Input
              label="Joint Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder="Enter joint name"
              maxLength={100}
            />

            <Select
              label="Joint Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              error={errors.type}
              required
            >
              {jointTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter a detailed description of the joint"
              rows={4}
              maxLength={1000}
              helperText="Provide a clear description of the joint, including its location and function."
            />
          </div>
        </div>

        {/* Mobility Range Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Mobility Range
          </h2>

          <MobilityRangeInput
            mobilityRange={formData.mobilityRange}
            onChange={handleMobilityRangeChange}
            error={errors.mobilityRange}
          />
        </div>

        {/* Movements Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Movements</h2>

          <MovementInput
            movements={formData.movements}
            onChange={handleMovementsChange}
            error={errors.movements}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft size={16} className="mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <Save size={16} className="mr-2" />
            {isLoading
              ? 'Saving...'
              : isEditMode
                ? 'Update Joint'
                : 'Create Joint'}
          </button>
        </div>
      </form>

      {/* Discard Changes Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={() => {
          setShowCancelDialog(false);
          navigateBack();
        }}
        title="Discard Changes"
        message="You have unsaved changes. Are you sure you want to discard them?"
        confirmText="Discard"
        cancelText="Continue Editing"
        type="info"
      />
    </div>
  );
};

export default JointForm;
