// src/components/media/MediaGallery.tsx
import { useState, useEffect } from 'react';
import {
  Grid,
  Video,
  FileImage,
  Filter,
  X,
  Star,
  Play,
  Maximize2,
} from 'lucide-react';
import type { ExerciseMedia } from '../../api/exerciseMediaService';
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
type MediaType = 'all' | 'video' | 'image' | 'svg';
type ViewAngle = 'all' | 'front' | 'side' | 'back' | 'diagonal' | '45-degree';

const MediaGallery = ({
  media,
  onSetPrimary,
  onDelete,

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

  // Helper to get video preview image
  const getVideoPreviewImage = (item: ExerciseMedia) => {
    if (item.urls?.preview) {
      return item.urls.preview;
    }

    if (item.urls?.thumbnail) {
      return item.urls.thumbnail;
    }

    // Fall back to thumbnail if poster is not available

    // Try preview as another fallback

    // If none of the above are available, return null
    return null;
  };

  // Get media type counts for filter buttons
  const getTypeCounts = () => {
    const counts = {
      all: media.length,
      video: media.filter((item) => item.mediaType === 'video').length,
      image: media.filter((item) => item.mediaType === 'image').length,
      svg: media.filter((item) => item.mediaType === 'svg').length,
    };
    return counts;
  };

  // Get view angle counts for filter buttons
  const getAngleCounts = () => {
    const counts = {
      all: media.length,
      front: media.filter((item) => item.viewAngle === 'front').length,
      side: media.filter((item) => item.viewAngle === 'side').length,
      back: media.filter((item) => item.viewAngle === 'back').length,
      diagonal: media.filter((item) => item.viewAngle === 'diagonal').length,
      '45-degree': media.filter((item) => item.viewAngle === '45-degree')
        .length,
    };
    return counts;
  };

  const typeCounts = getTypeCounts();
  const angleCounts = getAngleCounts();

  // Render media item based on type (grid mode)
  const renderMediaItem = (item: ExerciseMedia) => {
    const isPrimary = item.isPrimary;
    const videoPreviewUrl =
      item.mediaType === 'video' ? getVideoPreviewImage(item) : null;

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
        <button
          className={cn(
            'w-full text-left cursor-pointer overflow-hidden',
            viewMode === 'grid' ? 'h-full' : 'h-full flex-shrink-0 w-32'
          )}
          onClick={() => handlePreview(item)}
          type="button"
        >
          {item.mediaType === 'video' && (
            <div className="h-full w-full bg-gray-100 relative flex items-center justify-center">
              {videoPreviewUrl ? (
                <img
                  src={videoPreviewUrl}
                  alt={item.title || 'Video thumbnail'}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // If the image fails to load, show the fallback video icon
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add(
                      'fallback-video-display'
                    );
                  }}
                />
              ) : (
                <Video className="h-12 w-12 text-gray-400" />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-10 w-10 text-white" />
              </div>
            </div>
          )}

          {item.mediaType === 'image' && (
            <div className="h-full w-full bg-gray-100 relative flex items-center justify-center">
              <img
                src={item.url}
                alt={item.title || 'Exercise image'}
                className="h-full w-full object-cover"
                onError={(e) => {
                  // If the image fails to load, show a fallback icon
                  e.currentTarget.style.display = 'none';
                  const fallbackIcon = document.createElement('div');
                  fallbackIcon.innerHTML =
                    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                  fallbackIcon.className =
                    'h-12 w-12 text-gray-400 absolute inset-0 flex items-center justify-center';
                  e.currentTarget.parentElement?.appendChild(fallbackIcon);
                }}
              />
            </div>
          )}

          {item.mediaType === 'svg' && (
            <div className="h-full w-full bg-gray-50 flex items-center justify-center p-2">
              <img
                src={item.url}
                alt={item.title || 'Exercise SVG'}
                className="h-full w-full object-contain"
                onError={(e) => {
                  // If the SVG fails to load, show a fallback icon
                  e.currentTarget.style.display = 'none';
                  const fallbackIcon = document.createElement('div');
                  fallbackIcon.innerHTML =
                    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>';
                  fallbackIcon.className =
                    'h-12 w-12 text-gray-400 absolute inset-0 flex items-center justify-center';
                  e.currentTarget.parentElement?.appendChild(fallbackIcon);
                }}
              />
            </div>
          )}
        </button>

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
              item.mediaType === 'video'
                ? 'bg-purple-100 text-purple-800'
                : item.mediaType === 'image'
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
              type="button"
              className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
              onClick={() => handlePreview(item)}
              title="Preview"
            >
              <Maximize2 size={16} />
              <span className="sr-only">Preview</span>
            </button>

            {!isPrimary && onSetPrimary && (
              <button
                type="button"
                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                onClick={() => handleSetPrimary(item.id)}
                title="Set as primary"
              >
                <Star size={16} />
                <span className="sr-only">Set as primary</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                onClick={() => handleDelete(item.id)}
                title="Delete"
              >
                <X size={16} />
                <span className="sr-only">Delete</span>
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
        <div className="h-12 bg-gray-200 rounded w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded" />
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
                type="button"
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
              {typeCounts.video > 0 && (
                <button
                  type="button"
                  onClick={() => setMediaTypeFilter('video')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full',
                    mediaTypeFilter === 'video'
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  )}
                >
                  Videos ({typeCounts.video})
                </button>
              )}
              {typeCounts.image > 0 && (
                <button
                  type="button"
                  onClick={() => setMediaTypeFilter('image')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full',
                    mediaTypeFilter === 'image'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  )}
                >
                  Images ({typeCounts.image})
                </button>
              )}
              {typeCounts.svg > 0 && (
                <button
                  type="button"
                  onClick={() => setMediaTypeFilter('svg')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full',
                    mediaTypeFilter === 'svg'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  )}
                >
                  SVGs ({typeCounts.svg})
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
                type="button"
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
              {angleCounts.front > 0 && (
                <button
                  type="button"
                  onClick={() => setViewAngleFilter('front')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full',
                    viewAngleFilter === 'front'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  Front ({angleCounts.front})
                </button>
              )}
              {angleCounts.side > 0 && (
                <button
                  type="button"
                  onClick={() => setViewAngleFilter('side')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full',
                    viewAngleFilter === 'side'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  Side ({angleCounts.side})
                </button>
              )}
              {angleCounts.back > 0 && (
                <button
                  type="button"
                  onClick={() => setViewAngleFilter('back')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full',
                    viewAngleFilter === 'back'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  Back ({angleCounts.back})
                </button>
              )}
              {angleCounts.diagonal > 0 && (
                <button
                  type="button"
                  onClick={() => setViewAngleFilter('diagonal')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full',
                    viewAngleFilter === 'diagonal'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  Diagonal ({angleCounts.diagonal})
                </button>
              )}
              {angleCounts['45-degree'] > 0 && (
                <button
                  type="button"
                  onClick={() => setViewAngleFilter('45-degree')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full',
                    viewAngleFilter === '45-degree'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  45° ({angleCounts['45-degree']})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex space-x-1 items-start">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded',
              viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'
            )}
            title="Grid view"
          >
            <Grid size={18} className="text-gray-600" />
            <span className="sr-only">Grid view</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded',
              viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'
            )}
            title="List view"
          >
            <Filter size={18} className="text-gray-600" />
            <span className="sr-only">List view</span>
          </button>
        </div>

        {/* Clear filters button */}
        <button
          type="button"
          onClick={() => {
            setMediaTypeFilter('all');
            setViewAngleFilter('all');
          }}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          Clear filters
        </button>
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

      {/* Fallback styles */}
      <style>
        {`
          .fallback-video-display {
            position: relative;
          }
          .fallback-video-display::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: #f3f4f6;
            z-index: 0;
          }
        `}
      </style>
    </div>
  );
};

export default MediaGallery;
