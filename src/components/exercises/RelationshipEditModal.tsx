// src/components/exercises/RelationshipEditModal.tsx
import { useState, useEffect } from 'react';
import type { FC, ChangeEvent } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import Modal from '../ui/modal';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import type { ExerciseRelationship } from '../../api/relationshipService';

interface RelationshipEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  relationship: ExerciseRelationship | null;
  onUpdate: (data: {
    relationshipType: 'progression' | 'variation' | 'alternative';
    difficultyChange: number;
    bidirectional: boolean;
    modificationDetails?: {
      setupChanges: string;
      techniqueChanges: string;
      targetMuscleImpact: string;
    };
  }) => void;
  isSubmitting?: boolean;
}

/**
 * Modal component for editing existing relationships
 */
const RelationshipEditModal: FC<RelationshipEditModalProps> = ({
  isOpen,
  onClose,
  relationship,
  onUpdate,
  isSubmitting = false,
}) => {
  // Form state
  const [relationshipType, setRelationshipType] = useState<
    'progression' | 'variation' | 'alternative'
  >('variation');
  const [difficultyChange, setDifficultyChange] = useState<number>(0);
  const [bidirectional, setBidirectional] = useState<boolean>(false);
  const [modificationDetails, setModificationDetails] = useState<{
    setupChanges: string;
    techniqueChanges: string;
    targetMuscleImpact: string;
  }>({
    setupChanges: '',
    techniqueChanges: '',
    targetMuscleImpact: '',
  });

  // Initialize form with relationship data when it changes
  useEffect(() => {
    if (relationship) {
      setRelationshipType(relationship.relationshipType);
      setDifficultyChange(relationship.difficultyChange);
      setBidirectional(relationship.bidirectional);
      setModificationDetails(
        relationship.modificationDetails || {
          setupChanges: '',
          techniqueChanges: '',
          targetMuscleImpact: '',
        }
      );
    }
  }, [relationship]);

  const handleSubmit = () => {
    onUpdate({
      relationshipType,
      difficultyChange:
        relationshipType === 'progression' ? difficultyChange : 0,
      bidirectional: relationshipType !== 'progression' ? bidirectional : false,
      modificationDetails:
        relationshipType !== 'progression' ? modificationDetails : undefined,
    });
  };

  if (!relationship) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Relationship"
      size="md"
      footer={
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Relationship'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Relationship type */}
        <div>
          <label
            htmlFor="relationship-type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Relationship Type
          </label>
          <Select
            id="relationship-type"
            value={relationshipType}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setRelationshipType(
                e.target.value as 'progression' | 'variation' | 'alternative'
              )
            }
            disabled={isSubmitting}
          >
            <option value="progression">
              Progression - Part of a difficulty progression
            </option>
            <option value="variation">
              Variation - Similar movement pattern
            </option>
            <option value="alternative">
              Alternative - Substitute exercise
            </option>
          </Select>
        </div>

        {/* Conditional fields based on relationship type */}
        {relationshipType === 'progression' && (
          <div>
            <label
              htmlFor="difficulty-change"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Difficulty Change
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() =>
                  setDifficultyChange(Math.max(-3, difficultyChange - 1))
                }
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                disabled={isSubmitting}
                aria-label="Decrease difficulty"
              >
                -
              </button>
              <span
                id="difficulty-change"
                className="px-4 py-1 border border-gray-300 rounded-md w-12 text-center"
              >
                {difficultyChange > 0
                  ? `+${difficultyChange}`
                  : difficultyChange}
              </span>
              <button
                type="button"
                onClick={() =>
                  setDifficultyChange(Math.min(3, difficultyChange + 1))
                }
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                disabled={isSubmitting}
                aria-label="Increase difficulty"
              >
                +
              </button>
              <span className="flex items-center text-sm text-gray-500 ml-2">
                {difficultyChange > 0 ? (
                  <>
                    <ChevronUp size={16} className="text-red-500 mr-1" />
                    Harder than current
                  </>
                ) : difficultyChange < 0 ? (
                  <>
                    <ChevronDown size={16} className="text-green-500 mr-1" />
                    Easier than current
                  </>
                ) : (
                  'Same difficulty'
                )}
              </span>
            </div>
          </div>
        )}

        {/* Bidirectional checkbox (for non-progression relationships) */}
        {relationshipType !== 'progression' && (
          <div>
            <Checkbox
              id="bidirectional-edit"
              checked={bidirectional}
              onChange={(e) => setBidirectional(e.target.checked)}
              label="Bidirectional relationship"
              helperText="If checked, the relationship works both ways"
              disabled={isSubmitting}
            />
          </div>
        )}

        {/* Modification details for non-progression relationships */}
        {relationshipType !== 'progression' && (
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700">
              Modification Details
            </h5>

            <div>
              <label
                htmlFor="setup-changes"
                className="block text-xs text-gray-500 mb-1"
              >
                Setup Changes
              </label>
              <Textarea
                id="setup-changes"
                value={modificationDetails.setupChanges}
                onChange={(e) =>
                  setModificationDetails({
                    ...modificationDetails,
                    setupChanges: e.target.value,
                  })
                }
                placeholder="How does the setup differ between these exercises?"
                rows={2}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="technique-changes"
                className="block text-xs text-gray-500 mb-1"
              >
                Technique Changes
              </label>
              <Textarea
                id="technique-changes"
                value={modificationDetails.techniqueChanges}
                onChange={(e) =>
                  setModificationDetails({
                    ...modificationDetails,
                    techniqueChanges: e.target.value,
                  })
                }
                placeholder="How does the execution technique differ?"
                rows={2}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="muscle-impact"
                className="block text-xs text-gray-500 mb-1"
              >
                Target Muscle Impact
              </label>
              <Textarea
                id="muscle-impact"
                value={modificationDetails.targetMuscleImpact}
                onChange={(e) =>
                  setModificationDetails({
                    ...modificationDetails,
                    targetMuscleImpact: e.target.value,
                  })
                }
                placeholder="How does this change affect the muscles targeted?"
                rows={2}
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RelationshipEditModal;
