// src/pages/exercises/tabs/ExerciseMedia.tsx
import { useState, useEffect } from 'react';
import {
  Upload,
  CheckCircle,
  AlertTriangle,
  Layers,
  Camera,
} from 'lucide-react';
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

  // Handle media removal with confirmation
  const handleRemoveMedia = (mediaId: string) => {
    // For temporary files being uploaded, just remove directly
    if (mediaId.startsWith('temp-')) {
      removeMedia(mediaId);
      return;
    }

    // For actual media files, confirm deletion
    setMediaToDelete(mediaId);
    setShowDeleteDialog(true);
  };

  // Confirm media deletion
  const confirmDeleteMedia = async () => {
    if (!mediaToDelete) return;
    await removeMedia(mediaToDelete);
    setShowDeleteDialog(false);
    setMediaToDelete(null);
  };

  // Request to upload media for a specific angle
  const handleRequestUploadForAngle = (viewAngle: string) => {
    setActiveTab('upload');

    // Add a slight delay to ensure the tab has changed before focusing on adding media
    setTimeout(() => {
      // Scroll to upload section
      const uploadTabElement = document.getElementById('upload-tab-content');
      if (uploadTabElement) {
        uploadTabElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Display error state if the hook encountered any errors
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">
          Problem Loading Media
        </h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => fetchMedia()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Display loading state
  if (isLoading && media.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Media Statistics & Completeness Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* These components should be properly implemented elsewhere */}
        {typeof MediaCompletenessChecker !== 'undefined' && (
          <MediaCompletenessChecker
            exerciseId={exerciseId}
            onCheck={fetchMedia}
          />
        )}

        {typeof MediaStatistics !== 'undefined' && (
          <MediaStatistics exerciseId={exerciseId} />
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
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

      {/* Active tab content */}
      <div>
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            {/* Angle Coverage Overview - if component exists */}
            {typeof MediaAngleCoverage !== 'undefined' && (
              <MediaAngleCoverage
                media={media}
                onRequestUpload={handleRequestUploadForAngle}
              />
            )}

            {/* Gallery Component */}
            {media.length > 0 ? (
              <MediaGallery
                media={media}
                onSetPrimary={setPrimaryMedia}
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

        {activeTab === 'upload' && (
          <div id="upload-tab-content" className="space-y-6">
            {/* Upload Form */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Upload Media
                </h3>
                <div className="bg-blue-50 text-blue-800 px-3 py-1 text-xs rounded-full">
                  {media.length} / 20 media files
                </div>
              </div>

              <MediaUploader
                mediaFiles={mediaFiles}
                onMediaAdd={uploadMedia}
                onMediaRemove={handleRemoveMedia}
                onSetPrimary={setPrimaryMedia}
                onUpdateViewAngle={updateViewAngle}
                allowedTypes={['image', 'video', 'svg']}
                viewAngleRequired={true}
              />
            </div>

            {/* Upload Tips */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <Camera className="h-4 w-4 mr-2 text-gray-600" />
                Media Upload Tips
              </h4>
              <ul className="text-sm text-gray-600 space-y-2 ml-6 list-disc">
                <li>
                  Include media from all four view angles for complete coverage
                </li>
                <li>Videos should be 10-30 seconds long showing proper form</li>
                <li>
                  Images should clearly show the position at key points in the
                  exercise
                </li>
                <li>
                  High-contrast backgrounds help users focus on the movement
                </li>
                <li>
                  Ensure lighting is good and the subject is clearly visible
                </li>
                <li>
                  For exercises using equipment, make sure the equipment is
                  clearly visible
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'reorder' && media.length > 0 && (
          <MediaReorder media={media} onReorder={reorderMedia} />
        )}
      </div>

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
