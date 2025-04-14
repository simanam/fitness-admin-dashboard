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
import MediaCompletenessChecker from '../../../components/media/MediaCompletenessChecker';
import MediaStatistics from '../../../components/media/MediaStatistics';
import MediaAngleCoverage from '../../../components/media/MediaAngleCoverage';
import exerciseMediaService from '../../../api/exerciseMediaService';
import type { ViewAngle } from '../../../types/media';
import type {
  MediaStats,
  MediaCompletenessCheck,
} from '../../../api/exerciseMediaService';

interface ExerciseMediaProps {
  exerciseId: string;
}

const ExerciseMedia = ({ exerciseId }: ExerciseMediaProps) => {
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
  const [mediaStats, setMediaStats] = useState<MediaStats | null>(null);
  const [mediaCompleteness, setMediaCompleteness] =
    useState<MediaCompletenessCheck | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingCompleteness, setLoadingCompleteness] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [completenessError, setCompletenessError] = useState<string | null>(
    null
  );

  // Fetch media data
  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Clear cache on unmount
  useEffect(() => {
    return () => {
      exerciseMediaService?.clearCache?.(exerciseId);
    };
  }, [exerciseId]);

  // Fetch stats and completeness
  useEffect(() => {
    if (!isLoading && media.length > 0) {
      const fetchSecondaryData = async () => {
        setLoadingStats(true);
        setLoadingCompleteness(true);

        try {
          const stats = await exerciseMediaService.getMediaStats(exerciseId);
          setMediaStats(stats);
          setStatsError(null);
        } catch (err) {
          console.error('Error fetching media stats:', err);
          setStatsError('Failed to load statistics');
        } finally {
          setLoadingStats(false);
        }

        try {
          const completeness =
            await exerciseMediaService.checkMediaCompleteness(exerciseId);
          setMediaCompleteness(completeness);
          setCompletenessError(null);
        } catch (err) {
          console.error('Error checking media completeness:', err);
          setCompletenessError('Failed to check media completeness');
        } finally {
          setLoadingCompleteness(false);
        }
      };

      fetchSecondaryData();
    }
  }, [isLoading, media.length, exerciseId]);

  const handleRequestUploadForAngle = useCallback((angle: ViewAngle) => {
    setActiveTab('upload');
    // Add a slight delay to ensure the tab has changed before focusing
    setTimeout(() => {
      const uploadTabElement = document.getElementById('upload-tab-content');
      uploadTabElement?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const handleMediaUpload = async (file: File, viewAngle?: ViewAngle) => {
    const success = await uploadMedia(file, viewAngle);
    if (success) {
      await Promise.all([
        new Promise((resolve) =>
          setTimeout(() => {
            setLoadingStats(true);
            fetchMediaStats();
            resolve(null);
          }, 1000)
        ),
        new Promise((resolve) =>
          setTimeout(() => {
            setLoadingCompleteness(true);
            fetchMediaCompleteness();
            resolve(null);
          }, 2000)
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
          onClick={refreshAllData}
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
              onRequestUpload={handleRequestUploadForAngle}
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
            onMediaRemove={handleRemoveMedia}
            onSetPrimary={handleSetPrimary}
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
        onConfirm={confirmDeleteMedia}
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

export default ExerciseMedia;
