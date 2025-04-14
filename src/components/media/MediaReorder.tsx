// src/components/media/MediaReorder.tsx
import { useState, useEffect } from 'react';
import {
  GripVertical,
  Save,
  RefreshCw,
  FileVideo,
  Image as ImageIcon,
  FileImage,
} from 'lucide-react';
import type { ExerciseMedia } from '../../api/exerciseMediaService';
import { cn } from '../../lib/utils';

interface MediaReorderProps {
  media: ExerciseMedia[];
  onReorder: (mediaOrder: { id: string; order: number }[]) => Promise<void>;
  className?: string;
}

const MediaReorder = ({ media, onReorder, className }: MediaReorderProps) => {
  const [items, setItems] = useState<ExerciseMedia[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

  // Initialize items sorted by order
  useEffect(() => {
    setItems([...media].sort((a, b) => a.order - b.order));
  }, [media]);

  // Handle drag start
  const handleDragStart = (
    e: React.DragEvent,
    item: ExerciseMedia,
    index: number
  ) => {
    // Store the index as data to be transferred
    e.dataTransfer.setData('text/plain', index.toString());
    // Set a custom drag image (optional)
    const dragPreview = document.createElement('div');
    dragPreview.className =
      'bg-white border border-gray-300 rounded p-2 opacity-80 shadow-lg';
    dragPreview.textContent = item.title || `${item.mediaType} ${index + 1}`;
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, 0, 0);
    setTimeout(() => document.body.removeChild(dragPreview), 0);

    // Add a class to the dragged item
    e.currentTarget.classList.add('opacity-50');
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDraggedOverIndex(index);
  };

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedOverIndex(null);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = Number.parseInt(e.dataTransfer.getData('text/plain'), 10);

    if (dragIndex === dropIndex) return;

    const reorderedItems = [...items];
    const [movedItem] = reorderedItems.splice(dragIndex, 1);
    reorderedItems.splice(dropIndex, 0, movedItem);

    // Update order numbers
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    setItems(updatedItems);
    setIsDirty(true);
    setSuccess(null);
    setDraggedOverIndex(null);
  };

  // Save new order
  const handleSave = async () => {
    if (!isDirty) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Create order data for API
      const orderData = items.map((item, index) => ({
        id: item.id,
        order: index + 1,
      }));

      await onReorder(orderData);
      setIsDirty(false);
      setSuccess('Media order updated successfully');
    } catch (err) {
      console.error('Error updating media order:', err);
      setError('Failed to update media order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset order to original
  const handleReset = () => {
    setItems([...media].sort((a, b) => a.order - b.order));
    setIsDirty(false);
    setError(null);
    setSuccess(null);
  };

  // Get media type icon
  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType.toLowerCase()) {
      case 'video':
        return <FileVideo className="h-4 w-4 text-purple-500" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 text-green-500" />;
      case 'svg':
        return <FileImage className="h-4 w-4 text-blue-500" />;
      default:
        return <FileImage className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div
      className={cn('border rounded-lg bg-white overflow-hidden', className)}
    >
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-medium text-gray-900">Reorder Media</h3>

        <div className="flex space-x-2">
          {isDirty && (
            <>
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw size={14} className="mr-1" />
                Reset
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                className="inline-flex items-center px-3 py-1 text-sm border border-transparent rounded-md text-white bg-black hover:bg-gray-800 disabled:opacity-50"
              >
                <Save size={14} className="mr-1" />
                {isSubmitting ? 'Saving...' : 'Save Order'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-100 text-red-800 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border-b border-green-100 text-green-800 text-sm">
          {success}
        </div>
      )}

      {/* Drag and drop list */}
      <div className="p-4">
        <p className="text-sm text-gray-500 mb-4">
          Drag and drop the media items to change their display order. The first
          item will be shown first in galleries and lists.
        </p>

        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
                className={cn(
                  'flex items-center border rounded-md p-3 bg-white',
                  draggedOverIndex === index && 'border-blue-300 bg-blue-50',
                  item.isPrimary && 'border-blue-300 bg-blue-50',
                  'cursor-move'
                )}
              >
                <div className="mr-3 text-gray-400">
                  <GripVertical size={20} />
                </div>

                <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded border border-gray-200 mr-3">
                  {item.mediaType === 'video' && item.urls?.thumbnail ? (
                    <img
                      src={item.urls.thumbnail}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : item.mediaType === 'image' || item.mediaType === 'svg' ? (
                    <img
                      src={item.url}
                      alt="Media preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      {getMediaTypeIcon(item.mediaType)}
                    </div>
                  )}
                </div>

                <div className="flex-grow">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 truncate">
                      {item.title || `${item.mediaType} ${index + 1}`}
                    </span>
                    {item.isPrimary && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <div className="flex items-center mr-3">
                      {getMediaTypeIcon(item.mediaType)}
                      <span className="ml-1">{item.mediaType}</span>
                    </div>

                    <span className="mr-3">{item.viewAngle}</span>

                    {item.duration && <span>{item.duration.toFixed(1)}s</span>}
                  </div>
                </div>

                <div className="flex-shrink-0 ml-2 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-medium">
                  {index + 1}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No media files to reorder</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaReorder;
