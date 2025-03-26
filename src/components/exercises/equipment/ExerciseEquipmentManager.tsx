// src/components/exercises/equipment/ExerciseEquipmentManager.tsx
import { useState } from 'react';
import { Trash2, GripVertical, Plus, Info } from 'lucide-react';
import { useExerciseEquipment } from '../../../hooks/useExerciseEquipment';
import { Select } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { Checkbox } from '../../ui/checkbox';
import Modal from '../../ui/modal';
import ConfirmationDialog from '../../ui/confirmation-dialog';
import EmptyState from '../../ui/empty-state';
import DraggableItem from '../../ui/draggable-item';
import EquipmentStatusBadge from './EquipmentStatusBadge';

interface ExerciseEquipmentManagerProps {
  exerciseId: string;
}

const ExerciseEquipmentManager: React.FC<ExerciseEquipmentManagerProps> = ({
  exerciseId,
}) => {
  // Use our custom hook for equipment management
  const {
    equipmentLinks,
    availableEquipment,
    isLoading,
    isDragging,
    draggedItemId,
    isOrderChanged,
    stats,
    addEquipmentLink,
    updateEquipmentLink,
    deleteEquipmentLink,
    toggleRequired,
    saveNewOrder,
    handleDragStart,
    handleDrop,
    handleDragEnd,
  } = useExerciseEquipment({ exerciseId });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  // Form state
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [isRequired, setIsRequired] = useState(true);
  const [setupNotes, setSetupNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form values
  const resetForm = () => {
    setSelectedEquipmentId('');
    setIsRequired(true);
    setSetupNotes('');
  };

  // Handle adding equipment
  const handleAddEquipment = async () => {
    if (!selectedEquipmentId) {
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await addEquipmentLink({
        equipmentId: selectedEquipmentId,
        isRequired,
        setupNotes: setupNotes || undefined,
      });

      if (success) {
        resetForm();
        setShowAddModal(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting equipment link
  const handleDeleteEquipmentLink = async () => {
    if (!selectedLinkId) return;

    const success = await deleteEquipmentLink(selectedLinkId);
    if (success) {
      setShowDeleteDialog(false);
      setSelectedLinkId(null);
    }
  };

  // Update setup notes
  const updateSetupNotes = async (linkId: string, notes: string) => {
    await updateEquipmentLink(linkId, { setupNotes: notes });
  };

  // Confirm delete
  const confirmDelete = (linkId: string) => {
    setSelectedLinkId(linkId);
    setShowDeleteDialog(true);
  };

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with title and add button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Equipment</h3>
        <div className="flex space-x-2">
          {isOrderChanged && (
            <button
              onClick={saveNewOrder}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Save Order
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            disabled={availableEquipment.length === 0}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md ${
              availableEquipment.length === 0
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-500'
                : 'text-gray-700 bg-white hover:bg-gray-50'
            } focus:outline-none`}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Equipment
          </button>
        </div>
      </div>

      {/* Equipment list */}
      {equipmentLinks.length > 0 ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between">
            <div className="text-sm font-medium text-gray-700">
              {stats.required} required, {stats.optional} optional
            </div>
            {isDragging && (
              <div className="text-sm text-blue-600">
                Drop to reorder equipment
              </div>
            )}
          </div>

          <ul className="divide-y divide-gray-200">
            {equipmentLinks.map((link, index) => {
              const equipmentItem = link.equipment;
              if (!equipmentItem) return null;

              return (
                <DraggableItem
                  key={link.id}
                  id={link.id}
                  index={index}
                  isDragging={isDragging}
                  isDraggedOver={false}
                  draggedId={draggedItemId}
                  onDragStart={handleDragStart}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  className="px-4 py-5 sm:px-6"
                >
                  <div className="flex justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {equipmentItem.name}
                      </h4>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatCategoryName(equipmentItem.category)}
                        </span>
                        <EquipmentStatusBadge
                          isRequired={link.isRequired}
                          size="sm"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => toggleRequired(link.id)}
                        className={`px-2 py-1 rounded text-xs ${
                          link.isRequired
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        Mark as {link.isRequired ? 'Optional' : 'Required'}
                      </button>

                      <button
                        type="button"
                        onClick={() => confirmDelete(link.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    <Textarea
                      placeholder="Add setup notes for this equipment (optional)"
                      value={link.setupNotes || ''}
                      onChange={(e) =>
                        updateSetupNotes(link.id, e.target.value)
                      }
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </DraggableItem>
              );
            })}
          </ul>

          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 text-xs text-gray-500 flex items-center">
            <Info className="h-4 w-4 mr-1 text-gray-400" />
            Drag and drop items to reorder equipment
          </div>
        </div>
      ) : (
        <EmptyState
          icon={
            <div className="p-3 bg-gray-100 rounded-full">
              <GripVertical className="h-6 w-6 text-gray-400" />
            </div>
          }
          title="No equipment assigned"
          description="Add equipment that is required or recommended for this exercise."
          action={
            <button
              onClick={() => setShowAddModal(true)}
              disabled={availableEquipment.length === 0}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                availableEquipment.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'text-white bg-black hover:bg-gray-800'
              }`}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Equipment
            </button>
          }
        />
      )}

      {/* Add equipment modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          resetForm();
          setShowAddModal(false);
        }}
        title="Add Equipment"
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
              onClick={handleAddEquipment}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              disabled={isSubmitting || !selectedEquipmentId}
            >
              {isSubmitting ? 'Adding...' : 'Add Equipment'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Equipment <span className="text-red-500">*</span>
            </label>
            {/* {availableEquipment.map((item) => {
              console.log(item, 'item');
            })} */}
            <Select
              value={selectedEquipmentId}
              onChange={(e) => setSelectedEquipmentId(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">Select equipment to add</option>
              {availableEquipment.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({formatCategoryName(item.category)})
                </option>
              ))}
            </Select>
            {availableEquipment.length === 0 && (
              <p className="mt-1 text-sm text-yellow-600">
                All available equipment has already been assigned to this
                exercise.
              </p>
            )}
          </div>

          <div>
            <Checkbox
              id="isRequired"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              label="Required Equipment"
              helperText="When checked, this equipment is required to perform the exercise properly. If unchecked, it's optional."
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Setup Notes
            </label>
            <Textarea
              value={setupNotes}
              onChange={(e) => setSetupNotes(e.target.value)}
              placeholder="Add notes about the equipment setup (optional)"
              rows={3}
              disabled={isSubmitting}
            />
            <p className="mt-1 text-sm text-gray-500">
              Include details like how to set up the equipment, weight
              recommendations, or any special configurations.
            </p>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedLinkId(null);
        }}
        onConfirm={handleDeleteEquipmentLink}
        title="Remove Equipment"
        message={
          <p>
            Are you sure you want to remove this equipment from the exercise?
          </p>
        }
        confirmText="Remove"
        type="danger"
      />
    </div>
  );
};

export default ExerciseEquipmentManager;
