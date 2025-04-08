// src/components/movement-patterns/MovementPatternForm.tsx
import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';

interface MovementPatternFormProps {
  initialData?: {
    name: string;
    patternType: string;
    category: string;
    description: string;
  };
  onSubmit: (data: {
    name: string;
    patternType: string;
    category: string;
    description: string;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const MovementPatternForm: React.FC<MovementPatternFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    patternType: 'push',
    category: 'upper_body',
    description: '',
  });

  const [errors, setErrors] = useState<{
    name?: string;
    patternType?: string;
    category?: string;
    description?: string;
  }>({});

  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is modified
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: {
      name?: string;
      patternType?: string;
      category?: string;
      description?: string;
    } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.patternType) {
      newErrors.patternType = 'Pattern type is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Pattern Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        error={errors.name}
        disabled={isSubmitting}
      />

      <Select
        label="Pattern Type"
        name="patternType"
        value={formData.patternType}
        onChange={handleChange}
        required
        error={errors.patternType}
        disabled={isSubmitting}
      >
        <option value="push">Push</option>
        <option value="pull">Pull</option>
        <option value="squat">Squat</option>
        <option value="hinge">Hinge</option>
        <option value="lunge">Lunge</option>
        <option value="rotation">Rotation</option>
        <option value="gait">Gait</option>
        <option value="carry">Carry</option>
      </Select>

      <Select
        label="Category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        required
        error={errors.category}
        disabled={isSubmitting}
      >
        <option value="upper_body">Upper Body</option>
        <option value="lower_body">Lower Body</option>
        <option value="core">Core</option>
        <option value="full_body">Full Body</option>
      </Select>

      <Textarea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows={4}
        error={errors.description}
        disabled={isSubmitting}
        placeholder="Describe this movement pattern and its key characteristics..."
      />

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? initialData
              ? 'Updating...'
              : 'Creating...'
            : initialData
              ? 'Update Pattern'
              : 'Create Pattern'}
        </button>
      </div>
    </form>
  );
};

export default MovementPatternForm;
