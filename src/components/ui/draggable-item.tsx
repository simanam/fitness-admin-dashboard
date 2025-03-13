// src/components/ui/draggable-item.tsx
import React, { ReactNode } from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DraggableItemProps {
  id: string;
  index: number;
  children: ReactNode;
  isDragging: boolean;
  isDraggedOver: boolean;
  draggedId: string | null;
  onDragStart: (e: React.DragEvent, id: string, index: number) => void;
  onDragOver: (e: React.DragEvent, id: string, index: number) => void;
  onDrop: (e: React.DragEvent, id: string, index: number) => void;
  onDragEnd: () => void;
  className?: string;
  handleClassName?: string;
  showHandle?: boolean;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  index,
  children,
  isDragging,
  isDraggedOver,
  draggedId,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  className = '',
  handleClassName = '',
  showHandle = true,
}) => {
  return (
    <div
      draggable={isDragging || draggedId === null}
      onDragStart={(e) => onDragStart(e, id, index)}
      onDragOver={(e) => onDragOver(e, id, index)}
      onDrop={(e) => onDrop(e, id, index)}
      onDragEnd={onDragEnd}
      className={cn(
        'relative transition-colors duration-200',
        isDraggedOver && 'border-blue-500 bg-blue-50',
        draggedId === id && 'opacity-50',
        isDragging && 'cursor-move',
        className
      )}
    >
      <div className="flex items-start">
        {showHandle && (
          <div
            className={cn(
              'flex-shrink-0 self-center cursor-grab',
              handleClassName
            )}
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

export default DraggableItem;
