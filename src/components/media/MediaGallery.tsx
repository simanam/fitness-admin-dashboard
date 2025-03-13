// src/components/media/MediaGallery.tsx
import { useState, useEffect } from 'react';
import {
  Grid,
  Image as ImageIcon,
  Video,
  FileImage,
  Filter,
  X,
  Star,
  Play,
  Maximize2,
  Check,
} from 'lucide-react';
import { ExerciseMedia } from '../../api/exerciseMediaService';
import { cn } from '../../lib/utils';
import Modal from '../ui/modal';
import MediaPreview from './MediaPreview';

export interface MediaGalleryProps {
  media: ExerciseMedia[];
  onSetPrimary?: (mediaId: string) => Promise<void>;
  onDelete?: (mediaId: string) => Promise<void>;
  onReorder?: (mediaOrder: { id: string; order: number }[]) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type MediaType = 'all' | 'VIDEO' | 'IMAGE' | 'SVG';
type ViewAngle = 'all' | 'FRONT' | 'SIDE' | 'REAR' | 'ANGLE';

const MediaGallery = ({
  media,
  onSetPrimary,
  onDelete,
  onReorder,
  isLoading = false,
  className,
}: MediaGalleryProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaType>('all');
  const [viewAngleFilter, setViewAngleFilter] = useState<ViewAngle>('all');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [selectedMedia, setSelectedMedia] = useState<ExerciseMedia | null>(
    null
  );
  const [filteredMedia, setFilteredMedia] = useState<ExerciseMedia[]>(media);

  // Apply filters when media or filter settings change
  useEffect(() => {
    let filtered = [...media];

    // Apply media type filter
    if (mediaTypeFilter !== 'all') {
      filtered = filtered.filter((item) => item.mediaType === mediaTypeFilter);
    }

    // Apply view angle filter
    if (viewAngleFilter !== 'all') {
      filtered = filtered.filter((item) => item.viewAngle === viewAngleFilter);
    }

    // Sort by order
    filtered = filtered.sort((a, b) => a.order - b.order);

    setFilteredMedia(filtered);
  }, [media, mediaTypeFilter, viewAngleFilter]);

  // Handle setting primary media
  const handleSetPrimary = async (mediaId: string) => {
    if (onSetPrimary) {
      await onSetPrimary(mediaId);
    }
  };

  // Handle deleting media
  const handleDelete = async (mediaId: string) => {
    if (onDelete) {
      await onDelete(mediaId);
    }
  };

  // Handle media preview
  const handlePreview = (media: ExerciseMedia) => {
    setSelectedMedia(media);
    setShowPreview(true);
  };

  // Get media type counts for filter buttons
  const getTypeCounts = () => {
    const counts = {
      all: media.length,
      VIDEO: media.filter((item) => item.mediaType === 'VIDEO').length,
      IMAGE: media.filter((item) => item.mediaType === 'IMAGE').length,
      SVG: media.filter((item) => item.mediaType === 'SVG').length,
    };
    return counts;
  };

  // Get view angle counts for filter buttons
  const getAngleCounts = () => {
    const counts = {
      all: media.length,
      FRONT: media.filter((item) => item.viewAngle === 'FRONT').length,
      SIDE: media.filter((item) => item.viewAngle === 'SIDE').length,
      REAR: media.filter((item) => item.viewAngle === 'REAR').length,
      ANGLE: media.filter((item) => item.viewAngle === 'ANGLE').length,
    };
    return counts;
  };

  const typeCounts = getTypeCounts();
  const angleCounts = getAngleCounts();

  // Render media item based on type (grid mode)
  const renderMediaItem = (item: ExerciseMedia) => {
    const isPrimary = item.isPrimary;

    return (
      <div
        key={item.id}
        className={cn(
          'relative border rounded-md overflow-hidden group transition-all hover:shadow-md',
          isPrimary ? 'ring-2 ring-blue-500' : '',
          viewMode === 'grid' ? 'h-48' : 'h-24 flex'
        )}
      >
        {/* Media content */}
        <div
          className={cn(
            'cursor-pointer overflow-hidden',
            viewMode === 'grid' ? 'h-full' : 'h-full flex-shrink-0 w-32'
          )}
          onClick={() => handlePreview(item)}
        >
          {item.mediaType === 'VIDEO' && (
            <div className="h-full w-full bg-gray-100 relative flex items-center justify-center">
              {item.urls?.thumbnail ? (
                <img
                  src={item.urls.thumbnail}
                  alt={item.title || 'Video thumbnail'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Video className="h-12 w-12 text-gray-400" />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-10 w-10 text-white" />
              </div>
            </div>
          )}

          {item.mediaType === 'IMAGE' && (
            <img
              src={item.url}
              alt={item.title || 'Exercise image'}
              className="h-full w-full object-cover"
            />
          )}

          {item.mediaType === 'SVG' && (
            <div className="h-full w-full bg-gray-50 flex items-center justify-center p-2">
              <img
                src={item.url}
                alt={item.title || 'Exercise SVG'}
                className="h-full w-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Media info (list view only) */}
        {viewMode === 'list' && (
          <div className="flex-grow p-3">
            <div className="font-medium truncate">
              {item.title || `${item.mediaType} ${item.id.slice(0, 6)}`}
            </div>
            <div className="flex items-center mt-1 space-x-2 text-xs text-gray-500">
              <span>{item.mediaType}</span>
              <span>•</span>
              <span>{item.viewAngle}</span>
              {item.duration && (
                <>
                  <span>•</span>
                  <span>{item.duration.toFixed(1)}s</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {isPrimary && (
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              Primary
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2 flex space-x-1">
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              item.mediaType === 'VIDEO'
                ? 'bg-purple-100 text-purple-800'
                : item.mediaType === 'IMAGE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
            )}
          >
            {item.mediaType}
          </span>
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
            {item.viewAngle}
          </span>
        </div>

        {/* Action buttons (on hover) */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-2">
            <button
              className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
              onClick={() => handlePreview(item)}
              title="Preview"
            >
              <Maximize2 size={16} />
            </button>

            {!isPrimary && onSetPrimary && (
              <button
                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                onClick={() => handleSetPrimary(item.id)}
                title="Set as primary"
              >
                <Star size={16} />
              </button>
            )}

            {onDelete && (
              <button
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                onClick={() => handleDelete(item.id)}
                title="Delete"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded w-full"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Show empty state
  if (media.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No media files</h3>
        <p className="mt-2 text-gray-500">
          Upload media files to showcase this exercise.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter and View Controls */}
      <div className="flex flex-wrap gap-4 justify-between bg-white p-4 border border-gray-200 rounded-lg">
        <div className="flex flex-wrap gap-3">
          {/* Media Type Filters */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">
              Media Type
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setMediaTypeFilter('all')}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-full',
                  mediaTypeFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                All ({typeCounts.all})
              </button>
              {typeCounts.VIDEO > 0 && (
                <button
                  onClick={() => setMediaTypeFilter('VIDEO')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full',
                    mediaTypeFilter === 'VIDEO'
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  )}
                >
                  Videos ({typeCounts.VIDEO})
                </button>
              )}
              {typeCounts.IMAGE > 0 && (
                <button
                  onClick={() => setMediaTypeFilter('IMAGE')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full',
                    mediaTypeFilter === 'IMAGE'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  )}
                >
                  Images ({typeCounts.IMAGE})
                </button>
              )}
              {typeCounts.SVG > 0 && (
                <button
                  onClick={() => setMediaTypeFilter('SVG')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full',
                    mediaTypeFilter === 'SVG'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  )}
                >
                  SVGs ({typeCounts.SVG})
                </button>
              )}
            </div>
          </div>

          {/* View Angle Filters */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">
              View Angle
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setViewAngleFilter('all')}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-full',
                  viewAngleFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                All
              </button>
              {angleCounts.FRONT > 0 && (
                <button
                  onClick={() => setViewAngleFilter('FRONT')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full',
                    viewAngleFilter === 'FRONT'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  Front ({angleCounts.FRONT})
                </button>
              )}
              {angleCounts.SIDE > 0 && (
                <button
                  onClick={() => setViewAngleFilter('SIDE')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full',
                    viewAngleFilter === 'SIDE'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  Side ({angleCounts.SIDE})
                </button>
              )}
              {angleCounts.REAR > 0 && (
                <button
                  onClick={() => setViewAngleFilter('REAR')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full',
                    viewAngleFilter === 'REAR'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  Rear ({angleCounts.REAR})
                </button>
              )}
              {angleCounts.ANGLE > 0 && (
                <button
                  onClick={() => setViewAngleFilter('ANGLE')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full',
                    viewAngleFilter === 'ANGLE'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  Angle ({angleCounts.ANGLE})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex space-x-1 items-start">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded',
              viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'
            )}
            title="Grid view"
          >
            <Grid size={18} className="text-gray-600" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded',
              viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'
            )}
            title="List view"
          >
            <Filter size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Media Gallery */}
      {filteredMedia.length > 0 ? (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'space-y-3'
          )}
        >
          {filteredMedia.map((item) => renderMediaItem(item))}
        </div>
      ) : (
        <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-gray-500">
            No media found matching the selected filters.
          </p>
          <button
            onClick={() => {
              setMediaTypeFilter('all');
              setViewAngleFilter('all');
            }}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Media Preview Modal */}
      {selectedMedia && (
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title={selectedMedia.title || `${selectedMedia.mediaType} Preview`}
          size="xl"
        >
          <MediaPreview
            media={selectedMedia}
            onSetPrimary={
              onSetPrimary
                ? () => handleSetPrimary(selectedMedia.id)
                : undefined
            }
            onDelete={
              onDelete ? () => handleDelete(selectedMedia.id) : undefined
            }
          />
        </Modal>
      )}
    </div>
  );
};

export default MediaGallery;
