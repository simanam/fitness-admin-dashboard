// src/pages/exercises/tabs/ExerciseMedia.tsx
import { useState, useEffect, useCallback } from 'react';
import { Camera, AlertTriangle } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import MediaUploader from '../../../components/media/MediaUploader';
import MediaGallery from '../../../components/media/MediaGallery';
import MediaReorder from '../../../components/media/MediaReorder';
import ConfirmationDialog from '../../../components/ui/confirmation-dialog';
import EmptyState from '../../../components/ui/empty-state';
import { useMediaManagement } from '../../../hooks/useMediaManagement';
import MediaAngleCoverage from '../../../components/media/MediaAngleCoverage';
import exerciseMediaService from '../../../api/exerciseMediaService';
import type { ExerciseMedia } from '../../../api/exerciseMediaService';

// Define ViewAngle type since it's missing from types/media
type ViewAngle = ExerciseMedia['viewAngle'];

interface ExerciseMediaProps {
  exerciseId: string;
}

const ExerciseMediaComponent = ({ exerciseId }: ExerciseMediaProps) => {
  const {
    media,
    mediaFiles,
    isLoading,
    isDeleting,
    error,
    uploadMedia,
    removeMedia,
    setPrimaryMedia,
    updateViewAngle,
    reorderMedia,
    fetchMedia,
  } = useMediaManagement({ exerciseId });

  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload' | 'reorder'>(
    'gallery'
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<string | null>(null);

  const fetchSecondaryData = useCallback(async () => {
    try {
      await exerciseMediaService.getMediaStats(exerciseId);
    } catch (err) {
      console.error('Error fetching media stats:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load media statistics',
      });
    }

    try {
      await exerciseMediaService.checkMediaCompleteness(exerciseId);
    } catch (err) {
      console.error('Error checking media completeness:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to check media completeness',
      });
    }
  }, [exerciseId, showToast]);

  // Fetch media data
  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Clear cache on unmount
  useEffect(() => {
    return () => {
      // Clear local cache instead of using service method
      void fetchSecondaryData();
    };
  }, [fetchSecondaryData]);

  // Fetch stats and completeness
  useEffect(() => {
    if (!isLoading && media.length > 0) {
      void fetchSecondaryData();
    }
  }, [isLoading, media.length, fetchSecondaryData]);

  const handleRequestUploadForAngle = useCallback((angle: ViewAngle) => {
    setActiveTab('upload');
    // Add a slight delay to ensure the tab has changed before focusing
    setTimeout(() => {
      const uploadTabElement = document.getElementById('upload-tab-content');
      uploadTabElement?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return angle; // Use the angle parameter to prevent unused variable warning
  }, []);

  const handleMediaUpload = async (file: File, viewAngle?: ViewAngle) => {
    const success = await uploadMedia(file, viewAngle);
    if (success) {
      await Promise.all([
        new Promise((resolve) =>
          setTimeout(() => {
            void fetchSecondaryData();
            resolve(null);
          }, 1000)
        ),
      ]);
    }
    return success;
  };

  const handleRemoveMedia = async (mediaId: string): Promise<void> => {
    if (mediaId.startsWith('temp-')) {
      await removeMedia(mediaId);
      return;
    }
    setMediaToDelete(mediaId);
    setShowDeleteDialog(true);
  };

  const handleSetPrimary = async (mediaId: string): Promise<void> => {
    await setPrimaryMedia(mediaId);
  };

  const handleUpdateViewAngle = async (
    mediaId: string,
    angle: ViewAngle
  ): Promise<void> => {
    await updateViewAngle(mediaId, angle);
  };

  const handleReorderMedia = async (
    orderData: { id: string; order: number }[]
  ): Promise<void> => {
    await reorderMedia(orderData);
  };

  const handleConfirmDelete = async () => {
    if (mediaToDelete) {
      await removeMedia(mediaToDelete);
      setShowDeleteDialog(false);
      setMediaToDelete(null);
      void fetchSecondaryData();
    }
  };

  const handleRefreshData = async () => {
    await fetchMedia();
    void fetchSecondaryData();
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">
          Problem Loading Media
        </h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          type="button"
          onClick={handleRefreshData}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading && media.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('gallery')}
          className={`py-3 px-4 font-medium text-sm whitespace-nowrap ${
            activeTab === 'gallery'
              ? 'border-b-2 border-gray-900 text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Media Gallery
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`py-3 px-4 font-medium text-sm whitespace-nowrap ${
            activeTab === 'upload'
              ? 'border-b-2 border-gray-900 text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upload Media
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reorder')}
          className={`py-3 px-4 font-medium text-sm whitespace-nowrap ${
            activeTab === 'reorder'
              ? 'border-b-2 border-gray-900 text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Reorder Media
        </button>
      </div>

      {/* Gallery content */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          {typeof MediaAngleCoverage !== 'undefined' && (
            <MediaAngleCoverage
              media={media}
              onRequestUpload={(viewAngle: string) => {
                handleRequestUploadForAngle(viewAngle as ViewAngle);
              }}
            />
          )}

          {media.length > 0 ? (
            <MediaGallery
              media={media}
              onSetPrimary={handleSetPrimary}
              onDelete={handleRemoveMedia}
              isLoading={isLoading}
            />
          ) : (
            <EmptyState
              icon={<Camera size={36} className="text-gray-400" />}
              title="No media available"
              description="Upload images, videos, or SVGs to showcase this exercise."
              action={
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
                >
                  Upload Media
                </button>
              }
            />
          )}
        </div>
      )}

      {/* Upload content */}
      {activeTab === 'upload' && (
        <div id="upload-tab-content">
          <MediaUploader
            mediaFiles={mediaFiles}
            onMediaAdd={handleMediaUpload}
            onMediaDelete={handleRemoveMedia}
            onMediaPrimaryChange={handleSetPrimary}
            onUpdateViewAngle={handleUpdateViewAngle}
            allowedTypes={['image', 'video', 'svg']}
            viewAngleRequired={true}
          />
        </div>
      )}

      {/* Reorder content */}
      {activeTab === 'reorder' && media.length > 0 && (
        <MediaReorder media={media} onReorder={handleReorderMedia} />
      )}

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setMediaToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Media"
        message={
          <div>
            <p>
              Are you sure you want to delete this media file? This action
              cannot be undone.
            </p>
            {mediaToDelete &&
              media.find((m) => m.id === mediaToDelete)?.isPrimary && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  This is the primary media file. Deleting it will require
                  setting another file as primary.
                </div>
              )}
          </div>
        }
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ExerciseMediaComponent;
