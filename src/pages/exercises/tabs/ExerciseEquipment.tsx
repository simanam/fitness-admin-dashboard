// src/pages/exercises/tabs/ExerciseEquipment.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2, PenLine, GripVertical, Box } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import ConfirmationDialog from '../../../components/ui/confirmation-dialog';
import Modal from '../../../components/ui/modal';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import EmptyState from '../../../components/ui/empty-state';
import equipmentService, { Equipment } from '../../../api/equipmentService';
import exerciseEquipmentService, {
  EquipmentLink,
} from '../../../api/exerciseEquipmentService';

interface ExerciseEquipmentProps {
  exerciseId: string;
}

const ExerciseEquipment = ({ exerciseId }: ExerciseEquipmentProps) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [equipmentLinks, setEquipmentLinks] = useState<EquipmentLink[]>([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedLink, setSelectedLink] = useState<EquipmentLink | null>(null);

  // Form state
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
  const [isRequired, setIsRequired] = useState<boolean>(true);
  const [setupNotes, setSetupNotes] = useState<string>('');

  // Filtered equipment options (excluding already linked equipment)
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);

  // Fetch equipment data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all equipment and equipment links for this exercise
        const [linksData, equipmentData] = await Promise.all([
          exerciseEquipmentService.getEquipmentLinks(exerciseId),
          equipmentService.getAllEquipment(),
        ]);

        setEquipmentLinks(linksData);
        setAllEquipment(equipmentData);

        // Filter out already linked equipment
        updateAvailableEquipment(linksData, equipmentData);
      } catch (error) {
        console.error('Error fetching equipment data:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load equipment data',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [exerciseId]);

  // Update available equipment options when links change
  const updateAvailableEquipment = (
    links: EquipmentLink[],
    equipment: Equipment[]
  ) => {
    const linkedIds = links.map((link) => link.equipmentId);
    setAvailableEquipment(
      equipment.filter((item) => !linkedIds.includes(item.id))
    );
  };

  // Reset form state
  const resetForm = () => {
    setSelectedEquipmentId('');
    setIsRequired(true);
    setSetupNotes('');
    setSelectedLink(null);
  };

  // Add equipment link
  const handleAddEquipmentLink = async () => {
    if (!selectedEquipmentId) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select equipment',
      });
      return;
    }

    try {
      const newLink = await exerciseEquipmentService.createEquipmentLink({
        exerciseId,
        equipmentId: selectedEquipmentId,
        isRequired,
        setupNotes,
      });

      // Get complete equipment info
      const equipment = allEquipment.find((e) => e.id === selectedEquipmentId);
      if (equipment) {
        const completeLink = {
          ...newLink,
          equipment,
        };

        const updatedLinks = [...equipmentLinks, completeLink];
        setEquipmentLinks(updatedLinks);
        updateAvailableEquipment(updatedLinks, allEquipment);
      }

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Equipment added successfully',
      });

      resetForm();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding equipment:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to add equipment',
      });
    }
  };

  // Update equipment link
  const handleUpdateEquipmentLink = async () => {
    if (!selectedLink) return;

    try {
      const updatedLink = await exerciseEquipmentService.updateEquipmentLink(
        selectedLink.id,
        {
          isRequired,
          setupNotes,
        }
      );

      // Update the local state
      setEquipmentLinks(
        equipmentLinks.map((link) =>
          link.id === selectedLink.id
            ? {
                ...link,
                isRequired: updatedLink.isRequired,
                setupNotes: updatedLink.setupNotes,
              }
            : link
        )
      );

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Equipment updated successfully',
      });

      resetForm();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating equipment:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update equipment',
      });
    }
  };

  // Delete equipment link
  const handleDeleteEquipmentLink = async () => {
    if (!selectedLink) return;

    try {
      await exerciseEquipmentService.deleteEquipmentLink(selectedLink.id);

      const updatedLinks = equipmentLinks.filter(
        (link) => link.id !== selectedLink.id
      );
      setEquipmentLinks(updatedLinks);
      updateAvailableEquipment(updatedLinks, allEquipment);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Equipment removed successfully',
      });

      setSelectedLink(null);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting equipment link:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove equipment',
      });
    }
  };

  // Open edit modal
  const openEditModal = (link: EquipmentLink) => {
    setSelectedLink(link);
    setIsRequired(link.isRequired);
    setSetupNotes(link.setupNotes || '');
    setShowEditModal(true);
  };

  // Confirm delete
  const confirmDelete = (link: EquipmentLink) => {
    setSelectedLink(link);
    setShowDeleteDialog(true);
  };

  // Reorder equipment links (placeholder for future drag-and-drop functionality)
  const handleReorder = (dragIndex: number, dropIndex: number) => {
    const newItems = [...equipmentLinks];
    const dragItem = newItems[dragIndex];
    newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, dragItem);

    // Update the order property
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    setEquipmentLinks(reorderedItems);

    // Here you would also call an API to update the order in the backend
    // exerciseEquipmentService.updateOrder(reorderedItems.map(i => ({ id: i.id, order: i.order })));
  };

  // Group equipment by required/optional for display
  const requiredEquipment = equipmentLinks.filter((link) => link.isRequired);
  const optionalEquipment = equipmentLinks.filter((link) => !link.isRequired);

  // Get category name
  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      FREE_WEIGHTS: 'Free Weights',
      MACHINES: 'Machines',
      CABLES: 'Cables',
      BODYWEIGHT: 'Bodyweight',
      CARDIO: 'Cardio Equipment',
      ACCESSORIES: 'Accessories',
      OTHER: 'Other',
    };
    return categories[category] || category;
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

      {/* Equipment list */}
      {equipmentLinks.length > 0 ? (
        <div className="space-y-6">
          {/* Required equipment */}
          {requiredEquipment.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Required Equipment
              </h4>
              <div className="space-y-3">
                {requiredEquipment.map((link, index) => (
                  <div
                    key={link.id}
                    className="flex items-center border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
                  >
                    <div className="mr-3 text-gray-400 cursor-move">
                      <GripVertical size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h5 className="font-medium text-gray-900">
                          {link.equipment?.name}
                        </h5>
                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {getCategoryName(link.equipment?.category || '')}
                        </span>
                      </div>
                      {link.setupNotes && (
                        <p className="text-sm text-gray-500">
                          {link.setupNotes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(link)}
                        className="p-1 text-gray-400 hover:text-gray-800 rounded-full hover:bg-gray-100"
                      >
                        <PenLine size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(link)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional equipment */}
          {optionalEquipment.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Optional Equipment
              </h4>
              <div className="space-y-3">
                {optionalEquipment.map((link, index) => (
                  <div
                    key={link.id}
                    className="flex items-center border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
                  >
                    <div className="mr-3 text-gray-400 cursor-move">
                      <GripVertical size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h5 className="font-medium text-gray-900">
                          {link.equipment?.name}
                        </h5>
                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {getCategoryName(link.equipment?.category || '')}
                        </span>
                      </div>
                      {link.setupNotes && (
                        <p className="text-sm text-gray-500">
                          {link.setupNotes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(link)}
                        className="p-1 text-gray-400 hover:text-gray-800 rounded-full hover:bg-gray-100"
                      >
                        <PenLine size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(link)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={<Box className="h-12 w-12 text-gray-400" />}
          title="No equipment defined"
          description="Add equipment needed to perform this exercise."
          action={
            <button
              onClick={() => setShowAddModal(true)}
              disabled={availableEquipment.length === 0}
              className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md ${
                availableEquipment.length === 0
                  ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-700'
                  : 'text-white bg-black hover:bg-gray-800'
              } focus:outline-none`}
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
            >
              Cancel
            </button>
            <button
              onClick={handleAddEquipmentLink}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Add Equipment
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Equipment selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipment
            </label>
            <Select
              options={[
                { value: '', label: 'Select equipment' },
                ...availableEquipment.map((item) => ({
                  value: item.id,
                  label: `${item.name} (${getCategoryName(item.category)})`,
                })),
              ]}
              value={selectedEquipmentId}
              onChange={(e) => setSelectedEquipmentId(e.target.value)}
            />
            {availableEquipment.length === 0 && (
              <p className="mt-1 text-sm text-yellow-600">
                All available equipment has already been added to this exercise.
              </p>
            )}
          </div>

          {/* Required checkbox */}
          <div>
            <Checkbox
              id="isRequired"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              label="This equipment is required for the exercise"
              helperText="If unchecked, this will be listed as optional equipment"
            />
          </div>

          {/* Setup notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Setup Notes
            </label>
            <Textarea
              value={setupNotes}
              onChange={(e) => setSetupNotes(e.target.value)}
              placeholder="Add any specific setup instructions or notes for this equipment..."
              rows={3}
            />
          </div>
        </div>
      </Modal>

      {/* Edit equipment modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          resetForm();
          setShowEditModal(false);
        }}
        title="Edit Equipment"
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                resetForm();
                setShowEditModal(false);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateEquipmentLink}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Update
            </button>
          </div>
        }
      >
        {selectedLink && (
          <div className="space-y-4">
            {/* Equipment name (non-editable) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipment
              </label>
              <Input value={selectedLink.equipment?.name || ''} disabled />
            </div>

            {/* Required checkbox */}
            <div>
              <Checkbox
                id="isRequiredEdit"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                label="This equipment is required for the exercise"
                helperText="If unchecked, this will be listed as optional equipment"
              />
            </div>

            {/* Setup notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setup Notes
              </label>
              <Textarea
                value={setupNotes}
                onChange={(e) => setSetupNotes(e.target.value)}
                placeholder="Add any specific setup instructions or notes for this equipment..."
                rows={3}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedLink(null);
        }}
        onConfirm={handleDeleteEquipmentLink}
        title="Remove Equipment"
        message={
          <p>
            Are you sure you want to remove{' '}
            <span className="font-medium">{selectedLink?.equipment?.name}</span>{' '}
            from this exercise?
          </p>
        }
        confirmText="Remove"
        type="danger"
      />
    </div>
  );
};

export default ExerciseEquipment;
