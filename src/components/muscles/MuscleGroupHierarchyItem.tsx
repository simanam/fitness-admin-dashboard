// src/components/muscles/MuscleGroupHierarchyItem.tsx
import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  GripVertical,
  Plus,
} from 'lucide-react';
import { MuscleGroupHierarchyItem as HierarchyItemType } from '../../api/muscleGroupService';

interface MuscleGroupHierarchyItemProps {
  item: HierarchyItemType;
  level: number;
  onEdit: (group: HierarchyItemType) => void;
  onDelete: (group: HierarchyItemType) => void;
  onAddChild: (parentId: string) => void;
  onMove: (groupId: string, targetId: string | null) => void;
  isDragging: boolean;
  setDragging: (isDragging: boolean, groupId: string) => void;
  currentDragId: string | null;
}

const MuscleGroupHierarchyItem: React.FC<MuscleGroupHierarchyItemProps> = ({
  item,
  level,
  onEdit,
  onDelete,
  onAddChild,
  onMove,
  isDragging,
  setDragging,
  currentDragId,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [isOver, setIsOver] = useState(false);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('groupId', id);
    setDragging(true, id);
  };

  const handleDragEnd = () => {
    setDragging(false, '');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent, targetId: string | null) => {
    e.preventDefault();
    setIsOver(false);
    const draggedId = e.dataTransfer.getData('groupId');

    // Prevent dropping on itself
    if (draggedId === item.id) return;

    // Prevent dropping on its own children
    const isChild = (parent: HierarchyItemType, childId: string): boolean => {
      if (parent.id === childId) return true;
      return parent.children.some((child) => isChild(child, childId));
    };

    if (draggedId && targetId && !isChild(item, targetId)) {
      onMove(draggedId, targetId);
    }
  };

  const categoryColors = {
    UPPER_BODY: 'bg-blue-100 text-blue-800',
    LOWER_BODY: 'bg-green-100 text-green-800',
    CORE: 'bg-purple-100 text-purple-800',
  };

  const paddingLeft = `${level * 24}px`;

  return (
    <div>
      <div
        className={`flex items-center transition-colors duration-200 ${
          isOver ? 'bg-gray-100' : 'hover:bg-gray-50'
        } ${currentDragId === item.id ? 'opacity-50' : 'opacity-100'}`}
        style={{ paddingLeft }}
        draggable
        onDragStart={(e) => handleDragStart(e, item.id)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, item.id)}
      >
        <div className="p-2 text-gray-400 cursor-move">
          <GripVertical size={16} />
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 text-gray-500 hover:text-gray-700"
          disabled={item.children.length === 0}
        >
          {item.children.length > 0 ? (
            expanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )
          ) : (
            <div className="w-4" />
          )}
        </button>

        <div className="flex-1 py-2">
          <span className="font-medium text-gray-900">{item.name}</span>
          <span
            className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
              categoryColors[item.category as keyof typeof categoryColors]
            }`}
          >
            {item.category.replace('_', ' ')}
          </span>
          {item.muscles && item.muscles.length > 0 && (
            <span className="ml-2 text-xs text-gray-500">
              ({item.muscles.length} muscles)
            </span>
          )}
        </div>

        <div className="flex space-x-1 p-1">
          <button
            onClick={() => onAddChild(item.id)}
            className="p-1 text-gray-400 hover:text-gray-800 rounded-md hover:bg-gray-200"
            title="Add Child Group"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-1 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-200"
            title="Edit Group"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-200"
            title="Delete Group"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {expanded && item.children.length > 0 && (
        <div className="border-l border-gray-200 ml-10">
          {item.children.map((child) => (
            <MuscleGroupHierarchyItem
              key={child.id}
              item={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onMove={onMove}
              isDragging={isDragging}
              setDragging={setDragging}
              currentDragId={currentDragId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MuscleGroupHierarchyItem;
