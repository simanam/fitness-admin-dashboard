// src/components/muscles/MuscleGroupReorder.tsx
import React, { useState, useEffect } from 'react';
import { GripVertical, Save, RefreshCw } from 'lucide-react';
import { MuscleGroup } from '../../api/muscleService';

interface MuscleGroupReorderProps {
  groups: MuscleGroup[];
  isLoading: boolean;
  onReorder: (reorderData: { id: string; order: number }[]) => Promise<boolean>;
}

const MuscleGroupReorder: React.FC<MuscleGroupReorderProps> = ({
  groups,
  isLoading,
  onReorder,
}) => {
  const [items, setItems] = useState<MuscleGroup[]>([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize items when groups change
  useEffect(() => {
    setItems([...groups]);
  }, [groups]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    // Set transparent drag image
    const dragImg = document.createElement('div');
    dragImg.style.opacity = '0';
    document.body.appendChild(dragImg);
    e.dataTransfer.setDragImage(dragImg, 0, 0);
    document.body.removeChild(dragImg);
    // Required for Firefox
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null) return;
    if (draggedItemIndex === index) return;

    // Reorder items
    const newItems = [...items];
    const draggedItem = newItems[draggedItemIndex];
    newItems.splice(draggedItemIndex, 1);
    newItems.splice(index, 0, draggedItem);

    setItems(newItems);
    setDraggedItemIndex(index);
    setIsDirty(true);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const handleSave = async () => {
    if (!isDirty) return;

    setIsSaving(true);
    try {
      // Create reorder data with updated order
      const reorderData = items.map((item, index) => ({
        id: item.id,
        order: index + 1,
      }));

      const success = await onReorder(reorderData);
      if (success) {
        setIsDirty(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setItems([...groups]);
    setIsDirty(false);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">
          Reorder Muscle Groups
        </h3>
        {isDirty && (
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              disabled={isSaving}
            >
              <RefreshCw size={14} className="mr-1" />
              Reset
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-black hover:bg-gray-800"
              disabled={isSaving}
            >
              <Save size={14} className="mr-1" />
              {isSaving ? 'Saving...' : 'Save Order'}
            </button>
          </div>
        )}
      </div>

      <div className="p-2">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded" />
            ))}
          </div>
        ) : (
          <ul className="space-y-1">
            {items.map((item, index) => (
              <li
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center px-3 py-2 rounded-md ${
                  draggedItemIndex === index
                    ? 'bg-gray-100'
                    : 'hover:bg-gray-50'
                } cursor-move transition-colors duration-150`}
              >
                <GripVertical className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <div className="flex-1 flex items-center">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div
                    className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      item.category === 'UPPER_BODY'
                        ? 'bg-blue-100 text-blue-800'
                        : item.category === 'LOWER_BODY'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {item.category.replace('_', ' ')}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {item.parentGroupId
                    ? `Child of ${items.find((g) => g.id === item.parentGroupId)?.name || 'Parent'}`
                    : 'Top Level'}
                </div>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && items.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No muscle groups to reorder.
          </div>
        )}
      </div>
    </div>
  );
};

export default MuscleGroupReorder;
