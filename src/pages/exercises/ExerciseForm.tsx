// src/pages/exercises/ExerciseForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Trash2, CheckCircle, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import type { SelectOption } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import ConfirmationDialog from '../../components/ui/confirmation-dialog';
import exerciseService, { Exercise } from '../../api/exerciseService';

type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
type Mechanics = 'COMPOUND' | 'ISOLATION';
type Force = 'PUSH' | 'PULL';

interface FormData {
  name: string;
  description: string;
  difficulty: Difficulty;
  movement_pattern: string;
  mechanics: Mechanics;
  force: Force;
  equipment_required: boolean;
  bilateral: boolean;
  plane_of_motion: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  [key: string]: string | undefined;
}

const ExerciseForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditMode = !!id;

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    difficulty: 'INTERMEDIATE',
    movement_pattern: 'squat',
    mechanics: 'COMPOUND',
    force: 'PUSH',
    equipment_required: false,
    bilateral: true,
    plane_of_motion: 'sagittal',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [formTouched, setFormTouched] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Define select options
  const difficultyOptions: SelectOption[] = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
  ];

  const movementPatternOptions: SelectOption[] = [
    { value: 'squat', label: 'Squat' },
    { value: 'hinge', label: 'Hinge' },
    { value: 'push', label: 'Push' },
    { value: 'pull', label: 'Pull' },
    { value: 'carry', label: 'Carry' },
    { value: 'rotation', label: 'Rotation' },
    { value: 'lunge', label: 'Lunge' },
    { value: 'core', label: 'Core' },
  ];

  const mechanicsOptions: SelectOption[] = [
    { value: 'COMPOUND', label: 'Compound' },
    { value: 'ISOLATION', label: 'Isolation' },
  ];

  const forceOptions: SelectOption[] = [
    { value: 'PUSH', label: 'Push' },
    { value: 'PULL', label: 'Pull' },
  ];

  const planeOfMotionOptions: SelectOption[] = [
    { value: 'sagittal', label: 'Sagittal - Front to Back' },
    { value: 'frontal', label: 'Frontal - Side to Side' },
    { value: 'transverse', label: 'Transverse - Rotational' },
    { value: 'multi-planar', label: 'Multi-Planar - Multiple Planes' },
  ];

  // Fetch exercise data if in edit mode
  useEffect(() => {
    const fetchExercise = async () => {
      if (!id) return;

      setIsFetching(true);
      try {
        const exercise = await exerciseService.getExercise(id);
        setFormData({
          name: exercise.name || '',
          description: exercise.description || '',
          difficulty:
            (exercise.difficulty?.toUpperCase() as Difficulty) ||
            'INTERMEDIATE',
          movement_pattern: exercise.movement_pattern || 'squat',
          mechanics:
            (exercise.mechanics?.toUpperCase() as Mechanics) || 'COMPOUND',
          force: (exercise.force?.toUpperCase() as Force) || 'PUSH',
          equipment_required: exercise.equipment_required || false,
          bilateral: exercise.bilateral || true,
          plane_of_motion: exercise.plane_of_motion || 'sagittal',
        });
      } catch (error) {
        console.error('Error fetching exercise:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load exercise data',
        });
        navigate('/exercises');
      } finally {
        setIsFetching(false);
      }
    };

    if (isEditMode) {
      fetchExercise();
    }
  }, [id, isEditMode, navigate, showToast]);

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

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
    setFormTouched(true);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
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
        // Update existing exercise
        await exerciseService.updateExercise(id, formData);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Exercise updated successfully',
        });
        navigate(`/exercises/${id}`);
      } else {
        // Create new exercise
        const newExercise = await exerciseService.createExercise(formData);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Exercise created successfully',
        });
        navigate(`/exercises/${newExercise.id}`);
      }
    } catch (error) {
      console.error('Error saving exercise:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: `Failed to ${isEditMode ? 'update' : 'create'} exercise`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      await exerciseService.deleteExercise(id);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Exercise deleted successfully',
      });
      navigate('/exercises');
    } catch (error) {
      console.error('Error deleting exercise:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete exercise',
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
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
      navigate(`/exercises/${id}`);
    } else {
      navigate('/exercises');
    }
  };

  // Show loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button and title */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={handleCancel}
            className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
            type="button"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Exercise' : 'Create Exercise'}
          </h1>
        </div>

        <div className="flex space-x-2">
          {isEditMode && (
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              type="button"
              disabled={isLoading}
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="flex items-center px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
            type="button"
            disabled={isLoading}
          >
            <Save size={16} className="mr-1" />
            {isLoading ? 'Saving...' : 'Save Exercise'}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="space-y-4">
            <Input
              label="Exercise Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder="Enter exercise name"
              maxLength={100}
            />

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              placeholder="Enter a detailed description of the exercise"
              rows={5}
              maxLength={2000}
              helperText="Provide a clear description of the exercise, including proper form and execution."
            />
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Technical Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Difficulty Level"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              selectOptions={difficultyOptions}
            />

            <Select
              label="Movement Pattern"
              name="movement_pattern"
              value={formData.movement_pattern}
              onChange={handleChange}
              selectOptions={movementPatternOptions}
            />

            <Select
              label="Mechanics"
              name="mechanics"
              value={formData.mechanics}
              onChange={handleChange}
              selectOptions={mechanicsOptions}
              helperText="Compound exercises work multiple muscle groups, isolation exercises focus on a single muscle group."
            />

            <Select
              label="Force Type"
              name="force"
              value={formData.force}
              onChange={handleChange}
              selectOptions={forceOptions}
            />

            <Select
              label="Plane of Motion"
              name="plane_of_motion"
              value={formData.plane_of_motion}
              onChange={handleChange}
              selectOptions={planeOfMotionOptions}
            />

            <div className="flex flex-col space-y-4">
              <Checkbox
                id="equipment_required"
                name="equipment_required"
                checked={formData.equipment_required}
                onChange={handleCheckboxChange}
                label="Equipment Required"
                helperText="Check if this exercise requires equipment"
              />

              <Checkbox
                id="bilateral"
                name="bilateral"
                checked={formData.bilateral}
                onChange={handleCheckboxChange}
                label="Bilateral Movement"
                helperText="Check if this exercise works both sides of the body simultaneously"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Discard Changes Dialog */}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Exercise"
        message="Are you sure you want to delete this exercise? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        isLoading={isLoading}
      />
    </div>
  );
};

export default ExerciseForm;
