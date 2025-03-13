// src/pages/equipment/tabs/EquipmentAlternatives.tsx
import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Box } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import ConfirmationDialog from '../../../components/ui/confirmation-dialog';
import EmptyState from '../../../components/ui/empty-state';
import Modal from '../../../components/ui/modal';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import equipmentService, {
  Equipment,
  EquipmentAlternative,
} from '../../../api/equipmentService';

interface EquipmentAlternativesProps {
  equipment: Equipment;
  setEquipment: React.Dispatch<React.SetStateAction<Equipment | null>>;
}

const EquipmentAlternatives: React.FC<EquipmentAlternativesProps> = ({
  equipment,
  setEquipment,
}) => {
  const { showToast } = useToast();

  // State for alternatives management
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [alternativeName, setAlternativeName] = useState('');
  const [modification, setModification] = useState('');
  const [difficultyChange, setDifficultyChange] = useState(0);
  const [limitations, setLimitations] = useState('');

  // Get alternatives array safely
  const alternatives = equipment.alternatives?.equipment_options || [];

  // Handle adding a new alternative
  const handleAddAlternative = async () => {
    if (!alternativeName || !modification) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide a name and modification details',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const alternative: EquipmentAlternative = {
        name: alternativeName,
        modification_needed: modification,
        difficulty_change: difficultyChange,
        limitation_notes: limitations || undefined,
      };

      const updatedEquipment = await equipmentService.addAlternative(
        equipment.id,
        alternative
      );
      setEquipment(updatedEquipment);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Alternative equipment added successfully',
      });

      resetForm();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding alternative:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to add alternative equipment',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting an alternative
  const handleDeleteAlternative = async () => {
    if (!selectedAlternative) return;

    try {
      const updatedEquipment = await equipmentService.removeAlternative(
        equipment.id,
        selectedAlternative
      );
      setEquipment(updatedEquipment);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Alternative removed successfully',
      });

      setSelectedAlternative(null);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error removing alternative:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove alternative equipment',
      });
    }
  };

  // Confirm delete
  const confirmDelete = (name: string) => {
    setSelectedAlternative(name);
    setShowDeleteDialog(true);
  };

  // Reset form values
  const resetForm = () => {
    setAlternativeName('');
    setModification('');
    setDifficultyChange(0);
    setLimitations('');
  };

  return (
    <div className="space-y-6">
      {/* Header with title and add button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Alternative Equipment Options
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Alternative
        </button>
      </div>

      {/* Alternatives list */}
      {alternatives.length > 0 ? (
        <div className="space-y-4">
          {alternatives.map((alternative, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 flex items-center">
                      <Box className="h-5 w-5 mr-2 text-gray-500" />
                      {alternative.name}
                    </h4>
                    <div className="mt-2 space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">
                          Modification needed:
                        </span>{' '}
                        {alternative.modification_needed}
                      </p>

                      <p className="flex items-center">
                        <span className="font-medium mr-2">
                          Difficulty change:
                        </span>
                        <span
                          className={`flex items-center ${
                            alternative.difficulty_change > 0
                              ? 'text-red-600'
                              : alternative.difficulty_change < 0
                                ? 'text-green-600'
                                : 'text-gray-500'
                          }`}
                        >
                          {alternative.difficulty_change > 0 ? (
                            <ChevronUp className="h-4 w-4 mr-1" />
                          ) : alternative.difficulty_change < 0 ? (
                            <ChevronDown className="h-4 w-4 mr-1" />
                          ) : null}
                          {alternative.difficulty_change > 0 ? '+' : ''}
                          {alternative.difficulty_change}
                        </span>
                      </p>

                      {alternative.limitation_notes && (
                        <p>
                          <span className="font-medium">Limitations:</span>{' '}
                          {alternative.limitation_notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => confirmDelete(alternative.name)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                    title="Remove alternative"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Box size={36} className="text-gray-400" />}
          title="No alternatives defined"
          description="Add alternative equipment options that can be used as substitutes for this equipment."
          action={
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Alternative
            </button>
          }
        />
      )}

      {/* Add alternative modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          resetForm();
          setShowAddModal(false);
        }}
        title="Add Alternative Equipment"
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(false);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleAddAlternative}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Alternative'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alternative Equipment Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={alternativeName}
              onChange={(e) => setAlternativeName(e.target.value)}
              placeholder="e.g., Resistance Band"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modification Needed <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={modification}
              onChange={(e) => setModification(e.target.value)}
              placeholder="Describe how to use this alternative equipment..."
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty Change
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() =>
                  setDifficultyChange(Math.max(-3, difficultyChange - 1))
                }
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                -
              </button>
              <span className="px-4 py-1 border border-gray-300 rounded-md w-12 text-center">
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
              >
                +
              </button>
              <span className="text-sm text-gray-500 ml-2">
                {difficultyChange > 0
                  ? 'Harder than original'
                  : difficultyChange < 0
                    ? 'Easier than original'
                    : 'Same difficulty'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limitations
            </label>
            <Textarea
              value={limitations}
              onChange={(e) => setLimitations(e.target.value)}
              placeholder="Optional: Describe any limitations of this alternative equipment..."
              rows={3}
            />
          </div>
        </div>
      </Modal>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedAlternative(null);
        }}
        onConfirm={handleDeleteAlternative}
        title="Remove Alternative"
        message={
          <p>
            Are you sure you want to remove{' '}
            <span className="font-medium">{selectedAlternative}</span> as an
            alternative option?
          </p>
        }
        confirmText="Remove"
        type="danger"
      />
    </div>
  );
};

export default EquipmentAlternatives;
