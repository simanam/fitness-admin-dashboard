// src/pages/exercises/tabs/ExerciseMedia.tsx
import { useState } from 'react';
import {
  Upload,
  CheckCircle,
  AlertTriangle,
  Layers,
  Camera,
} from 'lucide-react';
import { useMediaManagement } from '../../../hooks/useMediaManagement';
import MediaUploader from '../../../components/media/MediaUploader';
import MediaGallery from '../../../components/media/MediaGallery';
import MediaReorder from '../../../components/media/MediaReorder';
import MediaCompletenessChecker from '../../../components/media/MediaCompletenessChecker';
import MediaStatistics from '../../../components/media/MediaStatistics';
import MediaAngleCoverage from '../../../components/media/MediaAngleCoverage';
import ConfirmationDialog from '../../../components/ui/confirmation-dialog';

interface ExerciseMediaProps {
  exerciseId: string;
}

const ExerciseMedia = ({ exerciseId }: ExerciseMediaProps) => {
  const {
    media,
    mediaFiles,
    isLoading,
    isDeleting,
    uploadMedia,
    removeMedia,
    setPrimaryMedia,
    updateViewAngle,
    reorderMedia,
    fetchMedia,
  } = useMediaManagement({ exerciseId });

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

  // Direct upload request with specified angle
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

  return (
    <div className="space-y-6">
      {/* Media Statistics & Completeness Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MediaCompletenessChecker
          exerciseId={exerciseId}
          onCheck={fetchMedia}
        />

        <MediaStatistics exerciseId={exerciseId} />
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
            {/* Angle Coverage Overview */}
            <MediaAngleCoverage
              media={media}
              onRequestUpload={handleRequestUploadForAngle}
            />

            {/* Gallery Component */}
            <MediaGallery
              media={media}
              onSetPrimary={setPrimaryMedia}
              onDelete={handleRemoveMedia}
              isLoading={isLoading}
            />
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

        {activeTab === 'reorder' && (
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
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ExerciseMedia;
