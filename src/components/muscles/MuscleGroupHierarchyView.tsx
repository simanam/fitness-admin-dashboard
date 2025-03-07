// src/components/muscles/MuscleGroupHierarchyView.tsx
import React, { useState } from 'react';
import { Layers, Plus } from 'lucide-react';
import MuscleGroupHierarchyItem from './MuscleGroupHierarchyItem';
import { MuscleGroupHierarchyItem as HierarchyItemType } from '../../api/muscleGroupService';
import EmptyState from '../ui/empty-state';

interface MuscleGroupHierarchyViewProps {
  hierarchy: HierarchyItemType[];
  isLoading: boolean;
  onEdit: (group: HierarchyItemType) => void;
  onDelete: (group: HierarchyItemType) => void;
  onAddRoot: () => void;
  onAddChild: (parentId: string) => void;
  onMove: (groupId: string, targetId: string | null) => void;
}

const MuscleGroupHierarchyView: React.FC<MuscleGroupHierarchyViewProps> = ({
  hierarchy,
  isLoading,
  onEdit,
  onDelete,
  onAddRoot,
  onAddChild,
  onMove,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentDragId, setCurrentDragId] = useState<string | null>(null);

  const handleSetDragging = (dragging: boolean, groupId: string) => {
    setIsDragging(dragging);
    setCurrentDragId(dragging ? groupId : null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const groupId = e.dataTransfer.getData('groupId');
    if (groupId) {
      // If dropped on the root area, move to null parent (top level)
      onMove(groupId, null);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded w-full"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (hierarchy.length === 0) {
    return (
      <EmptyState
        icon={<Layers size={36} className="text-gray-400" />}
        title="No muscle groups defined"
        description="Create your first muscle group to start organizing muscles."
        action={
          <button
            onClick={onAddRoot}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
          >
            <Plus size={16} className="mr-2" />
            Add Muscle Group
          </button>
        }
      />
    );
  }

  return (
    <div
      className={`border border-gray-200 rounded-lg bg-white ${
        isDragging ? 'ring-2 ring-gray-300' : ''
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">
          Muscle Group Hierarchy
        </h3>
        <button
          onClick={onAddRoot}
          className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50"
        >
          <Plus size={14} className="mr-1" />
          Add Root Group
        </button>
      </div>

      <div className="p-1">
        {hierarchy.map((item) => (
          <MuscleGroupHierarchyItem
            key={item.id}
            item={item}
            level={0}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
            onMove={onMove}
            isDragging={isDragging}
            setDragging={handleSetDragging}
            currentDragId={currentDragId}
          />
        ))}
      </div>

      {isDragging && (
        <div
          className="border-t border-gray-200 p-4 text-center text-sm text-gray-500 bg-gray-50"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          Drop here to make a top-level group
        </div>
      )}
    </div>
  );
};

export default MuscleGroupHierarchyView;
