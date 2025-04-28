// src/components/exercises/form/TechnicalDetailsSection.tsx
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { Select } from '../../ui/select';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';

const TechnicalDetailsSection: FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      {/* Movement Pattern */}
      <div>
        <label
          htmlFor="movement_pattern"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Movement Pattern <span className="text-red-500">*</span>
        </label>
        <Select
          id="movement_pattern"
          {...register('movement_pattern', {
            required: 'Movement pattern is required',
          })}
        >
          <option value="push">Push</option>
          <option value="pull">Pull</option>
          <option value="squat">Squat</option>
          <option value="hinge">Hinge</option>
          <option value="lunge">Lunge</option>
          <option value="carry">Carry</option>
          <option value="rotation">Rotation</option>
          <option value="gait">Gait</option>
        </Select>
        {errors.movement_pattern && (
          <p className="mt-1 text-sm text-red-600">
            {errors.movement_pattern.message as string}
          </p>
        )}
      </div>

      {/* Mechanics */}
      <div>
        <label
          htmlFor="mechanics"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Mechanics <span className="text-red-500">*</span>
        </label>
        <Select
          id="mechanics"
          {...register('mechanics', {
            required: 'Mechanics is required',
          })}
        >
          <option value="compound">Compound</option>
          <option value="isolation">Isolation</option>
        </Select>
        {errors.mechanics && (
          <p className="mt-1 text-sm text-red-600">
            {errors.mechanics.message as string}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Compound exercises work multiple muscle groups, isolation exercises
          focus on a single muscle
        </p>
      </div>

      {/* Force */}
      <div>
        <label
          htmlFor="force"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Force Type <span className="text-red-500">*</span>
        </label>
        <Select
          id="force"
          {...register('force', {
            required: 'Force type is required',
          })}
        >
          <option value="push">Push</option>
          <option value="pull">Pull</option>
          <option value="carry">Carry</option>
          <option value="static">Static</option>
        </Select>
        {errors.force && (
          <p className="mt-1 text-sm text-red-600">
            {errors.force.message as string}
          </p>
        )}
      </div>

      {/* Plane of Motion */}
      <div>
        <label
          htmlFor="plane_of_motion"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Plane of Motion <span className="text-red-500">*</span>
        </label>
        <Select
          id="plane_of_motion"
          {...register('plane_of_motion', {
            required: 'Plane of motion is required',
          })}
        >
          <option value="sagittal">Sagittal</option>
          <option value="frontal">Frontal</option>
          <option value="transverse">Transverse</option>
          <option value="multi-planar">Multi-planar</option>
        </Select>
        {errors.plane_of_motion && (
          <p className="mt-1 text-sm text-red-600">
            {errors.plane_of_motion.message as string}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Sagittal: forward/backward, Frontal: side to side, Transverse:
          rotational
        </p>
      </div>

      {/* Primary Focus */}
      <div>
        <label
          htmlFor="primary_focus"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Primary Focus
        </label>
        <Select id="primary_focus" {...register('primary_focus')}>
          <option value="">Not specified</option>
          <option value="strength">Strength</option>
          <option value="hypertrophy">Hypertrophy</option>
          <option value="endurance">Endurance</option>
          <option value="power">Power</option>
        </Select>
        <p className="mt-1 text-xs text-gray-500">
          The primary training goal this exercise is designed for
        </p>
      </div>
      {/* Optimal Rest Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Optimal Rest Time (optional)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="optimal_rest_time_default"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Default Rest
            </label>
            <Input
              id="optimal_rest_time_default"
              {...register('optimal_rest_time.default')}
              placeholder="e.g., 60s or 2m"
            />
          </div>
          <div>
            <label
              htmlFor="optimal_rest_time_min"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Minimum Rest
            </label>
            <Input
              id="optimal_rest_time_min"
              {...register('optimal_rest_time.min')}
              placeholder="e.g., 30s"
            />
          </div>
          <div>
            <label
              htmlFor="optimal_rest_time_max"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Maximum Rest
            </label>
            <Input
              id="optimal_rest_time_max"
              {...register('optimal_rest_time.max')}
              placeholder="e.g., 3m"
            />
          </div>
        </div>
        <div className="mt-3">
          <label
            htmlFor="optimal_rest_time_notes"
            className="block text-xs font-medium text-gray-600 mb-1"
          >
            Rest Time Notes (optional-in seconds)
          </label>
          <Textarea
            id="optimal_rest_time_notes"
            {...register('optimal_rest_time.notes')}
            placeholder="Any additional notes about rest periods"
            rows={2}
          />
        </div>
      </div>

      {/* Tempo Recommendations */}
      <div>
        <label
          htmlFor="tempo_default"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Tempo Recommendation (optional)
        </label>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="tempo_default"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Default Tempo
            </label>
            <Input
              id="tempo_default"
              {...register('tempo_recommendations.default')}
              placeholder="e.g., 3-1-2-0"
            />
            <p className="mt-1 text-xs text-gray-500">
              Format: eccentric-bottom hold-concentric-top hold (in seconds)
            </p>
          </div>

          <div>
            <label
              htmlFor="tempo_notes"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Tempo Notes (optional)
            </label>
            <Textarea
              id="tempo_notes"
              {...register('tempo_recommendations.tempo_notes')}
              placeholder="Any additional notes about tempo"
              rows={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalDetailsSection;
