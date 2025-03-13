// src/hooks/useExerciseEquipment.ts
import { useState, useEffect } from 'react';
import { useToast } from './useToast';
import exerciseEquipmentService, {
  EquipmentLink,
  CreateEquipmentLinkPayload,
  UpdateEquipmentLinkPayload,
} from '../api/exerciseEquipmentService';
import equipmentService, { Equipment } from '../api/equipmentService';

interface UseExerciseEquipmentProps {
  exerciseId: string;
}

export const useExerciseEquipment = ({
  exerciseId,
}: UseExerciseEquipmentProps) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [equipmentLinks, setEquipmentLinks] = useState<EquipmentLink[]>([]);
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [isOrderChanged, setIsOrderChanged] = useState(false);
  const [stats, setStats] = useState({
    required: 0,
    optional: 0,
    total: 0,
  });

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, [exerciseId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch both equipment links and available equipment in parallel
      const [linksData, allEquipment] = await Promise.all([
        exerciseEquipmentService.getEquipmentLinks(exerciseId),
        equipmentService.getAllEquipment(),
      ]);

      // Sort links by order
      const sortedLinks = [...linksData].sort((a, b) => a.order - b.order);
      setEquipmentLinks(sortedLinks);

      // Calculate stats
      const required = sortedLinks.filter((link) => link.isRequired).length;
      setStats({
        required,
        optional: sortedLinks.length - required,
        total: sortedLinks.length,
      });

      // Find equipment not yet linked
      const linkedIds = sortedLinks.map((link) => link.equipmentId);
      const available = allEquipment.filter(
        (item) => !linkedIds.includes(item.id)
      );
      setAvailableEquipment(available);
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

  // Add equipment link
  const addEquipmentLink = async (
    payload: Omit<CreateEquipmentLinkPayload, 'exerciseId'>
  ) => {
    try {
      const fullPayload = {
        ...payload,
        exerciseId,
      };

      const newLink =
        await exerciseEquipmentService.createEquipmentLink(fullPayload);

      // Set order for the new link (place at the end)
      const maxOrder =
        equipmentLinks.length > 0
          ? Math.max(...equipmentLinks.map((link) => link.order))
          : 0;

      await exerciseEquipmentService.updateEquipmentLink(newLink.id, {
        order: maxOrder + 1,
      });

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Equipment added successfully',
      });

      // Refresh data
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error adding equipment:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to add equipment',
      });
      return false;
    }
  };

  // Update equipment link
  const updateEquipmentLink = async (
    linkId: string,
    payload: UpdateEquipmentLinkPayload
  ) => {
    try {
      await exerciseEquipmentService.updateEquipmentLink(linkId, payload);

      // Update local state if this is a simple update (not reordering)
      if (!payload.order) {
        setEquipmentLinks((links) =>
          links.map((link) =>
            link.id === linkId ? { ...link, ...payload } : link
          )
        );

        // Update stats if required status changed
        if (payload.isRequired !== undefined) {
          const newLinks = equipmentLinks.map((link) =>
            link.id === linkId
              ? { ...link, isRequired: payload.isRequired! }
              : link
          );
          const required = newLinks.filter((link) => link.isRequired).length;
          setStats({
            required,
            optional: newLinks.length - required,
            total: newLinks.length,
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating equipment link:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update equipment',
      });
      return false;
    }
  };

  // Delete equipment link
  const deleteEquipmentLink = async (linkId: string) => {
    try {
      await exerciseEquipmentService.deleteEquipmentLink(linkId);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Equipment removed successfully',
      });

      // Refresh data
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error removing equipment:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove equipment',
      });
      return false;
    }
  };

  // Toggle required/optional status
  const toggleRequired = async (linkId: string) => {
    const link = equipmentLinks.find((l) => l.id === linkId);
    if (!link) return false;

    return await updateEquipmentLink(linkId, { isRequired: !link.isRequired });
  };

  // Reorder equipment
  const reorderEquipment = (sourceIndex: number, targetIndex: number) => {
    // Don't reorder if indices are the same
    if (sourceIndex === targetIndex) return;

    // Create a new array with the reordered items
    const newLinks = [...equipmentLinks];
    const [removed] = newLinks.splice(sourceIndex, 1);
    newLinks.splice(targetIndex, 0, removed);

    // Update order property on each item
    const reorderedLinks = newLinks.map((link, index) => ({
      ...link,
      order: index + 1,
    }));

    setEquipmentLinks(reorderedLinks);
    setIsOrderChanged(true);
  };

  // Save the new order of equipment
  const saveNewOrder = async () => {
    try {
      const orderData = equipmentLinks.map((link, index) => ({
        id: link.id,
        order: index + 1,
      }));

      await exerciseEquipmentService.updateOrder(exerciseId, orderData);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Equipment order updated',
      });

      setIsOrderChanged(false);
      return true;
    } catch (error) {
      console.error('Error updating equipment order:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update equipment order',
      });
      return false;
    }
  };

  // Handle drag and drop events
  const handleDragStart = (e: React.DragEvent, id: string, index: number) => {
    e.dataTransfer.setData('linkId', id);
    e.dataTransfer.setData('index', String(index));

    // Create transparent drag image
    const dragImg = document.createElement('div');
    dragImg.style.opacity = '0';
    document.body.appendChild(dragImg);
    e.dataTransfer.setDragImage(dragImg, 0, 0);
    document.body.removeChild(dragImg);

    setIsDragging(true);
    setDraggedItemId(id);
  };

  const handleDrop = (
    e: React.DragEvent,
    targetId: string,
    targetIndex: number
  ) => {
    e.preventDefault();

    const sourceId = e.dataTransfer.getData('linkId');
    const sourceIndex = parseInt(e.dataTransfer.getData('index'));

    // Don't do anything if dropping on the same item
    if (sourceId === targetId) return;

    reorderEquipment(sourceIndex, targetIndex);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedItemId(null);
  };

  return {
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
    reorderEquipment,
    saveNewOrder,
    handleDragStart,
    handleDrop,
    handleDragEnd,
    setIsDragging,
    setDraggedItemId,
    refreshData: fetchData,
  };
};

export default useExerciseEquipment;
