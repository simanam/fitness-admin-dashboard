// src/pages/exercises/tabs/ExerciseMedia.tsx
import { useState, useEffect } from 'react';
import {
  Video,
  Image as ImageIcon,
  Star,
  Trash2,
  AlertTriangle,
  XCircle,
  CheckCircle,
  LifeBuoy,
} from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import ConfirmationDialog from '../../../components/ui/confirmation-dialog';
import EmptyState from '../../../components/ui/empty-state';
import MediaUploader, {
  MediaFile,
} from '../../../components/media/MediaUploader';
import exerciseMediaService, {
  ExerciseMedia as Media,
} from '../../../api/exerciseMediaService';

interface ExerciseMediaProps {
  exerciseId: string;
}

const ExerciseMedia = ({ exerciseId }: ExerciseMediaProps) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [media, setMedia] = useState<Media[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState<MediaFile[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [completenessCheck, setCompletenessCheck] = useState<{
    isComplete: boolean;
    missingAngles: string[];
    missingTypes: string[];
    recommendations: string[];
  } | null>(null);

  // Fetch media data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch media and completeness check
        const [mediaData, completenessData] = await Promise.all([
          exerciseMediaService.getExerciseMedia(exerciseId),
          exerciseMediaService.checkMediaCompleteness(exerciseId),
        ]);

        setMedia(mediaData);
        setCompletenessCheck(completenessData);
      } catch (error) {
        console.error('Error fetching media data:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load media data',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [exerciseId]);

  // Handle media upload
  const handleMediaAdd = async (file: File, viewAngle?: string) => {
    // Add to uploading state first with progress at 0
    const newMediaFile: MediaFile = {
      id: `temp-${Date.now()}`,
      file,
      url: URL.createObjectURL(file),
      type: getMediaTypeFromFile(file),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
      viewAngle: viewAngle as any,
    };

    setUploadingMedia((prev) => [...prev, newMediaFile]);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('exerciseId', exerciseId);
      formData.append('file', file);
      formData.append('viewAngle', viewAngle || 'FRONT');
      formData.append('mediaType', getMediaTypeFromFile(file).toUpperCase());
      formData.append('title', file.name);

      // Upload with progress tracking
      const uploadedMedia = await exerciseMediaService.uploadMedia(
        formData,
        (progress) => {
          // Update progress in the uploading state
          setUploadingMedia((prev) =>
            prev.map((item) =>
              item.id === newMediaFile.id ? { ...item, progress } : item
            )
          );
        }
      );

      // Add the new media to the state
      setMedia((prev) => [...prev, uploadedMedia]);

      // Remove from uploading state
      setUploadingMedia((prev) =>
        prev.filter((item) => item.id !== newMediaFile.id)
      );

      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(newMediaFile.url);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Media uploaded successfully',
      });

      // Refresh completeness check
      const completenessData =
        await exerciseMediaService.checkMediaCompleteness(exerciseId);
      setCompletenessCheck(completenessData);
    } catch (error) {
      console.error('Error uploading media:', error);

      // Update status to error
      setUploadingMedia((prev) =>
        prev.map((item) =>
          item.id === newMediaFile.id ? { ...item, status: 'error' } : item
        )
      );

      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to upload media',
      });
    }
  };

  // Handle media removal
  const handleMediaRemove = async () => {
    if (!selectedMedia) return;

    try {
      await exerciseMediaService.deleteMedia(selectedMedia.id);

      setMedia((prevMedia) =>
        prevMedia.filter((m) => m.id !== selectedMedia.id)
      );

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Media removed successfully',
      });

      // Refresh completeness check
      const completenessData =
        await exerciseMediaService.checkMediaCompleteness(exerciseId);
      setCompletenessCheck(completenessData);

      setSelectedMedia(null);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error removing media:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove media',
      });
    }
  };

  // Handle setting a media as primary
  const handleSetPrimary = async (mediaId: string) => {
    try {
      await exerciseMediaService.setPrimaryMedia(mediaId);

      // Update local state
      setMedia((prevMedia) =>
        prevMedia.map((m) => ({
          ...m,
          isPrimary: m.id === mediaId,
        }))
      );

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Primary media set successfully',
      });
    } catch (error) {
      console.error('Error setting primary media:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to set primary media',
      });
    }
  };

  // Handle updating view angle
  const handleUpdateViewAngle = async (mediaId: string, viewAngle: string) => {
    try {
      await exerciseMediaService.updateMediaViewAngle(mediaId, viewAngle);

      // Update local state
      setMedia((prevMedia) =>
        prevMedia.map((m) => (m.id === mediaId ? { ...m, viewAngle } : m))
      );

      // Refresh completeness check
      const completenessData =
        await exerciseMediaService.checkMediaCompleteness(exerciseId);
      setCompletenessCheck(completenessData);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'View angle updated successfully',
      });
    } catch (error) {
      console.error('Error updating view angle:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update view angle',
      });
    }
  };

  // Confirm delete
  const confirmDelete = (mediaItem: Media) => {
    setSelectedMedia(mediaItem);
    setShowDeleteDialog(true);
  };

  // Get the media type from file extension
  const getMediaTypeFromFile = (file: File): 'image' | 'video' | 'svg' => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (file.type === 'image/svg+xml' || extension === 'svg') {
      return 'svg';
    } else if (
      file.type.startsWith('video/') ||
      ['mp4', 'webm', 'mov'].includes(extension || '')
    ) {
      return 'video';
    } else {
      return 'image';
    }
  };

  // Convert API media objects to MediaFile format for the uploader component
  const mediaFilesForUploader: MediaFile[] = media.map((m) => ({
    id: m.id,
    url: m.url || '',
    type: m.mediaType.toLowerCase() as 'image' | 'video' | 'svg',
    name: m.title || `${m.mediaType} - ${m.viewAngle}`,
    size: 0, // Size isn't typically returned from the API
    viewAngle: m.viewAngle,
    isPrimary: m.isPrimary,
  }));

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Media completeness summary */}
      {completenessCheck && (
        <div
          className={`border rounded-lg p-4 ${
            completenessCheck.isComplete
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <div className="flex items-start">
            {completenessCheck.isComplete ? (
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
            )}
            <div>
              <h3 className="text-sm font-medium">
                {completenessCheck.isComplete
                  ? 'Media coverage is complete'
                  : 'Media coverage is incomplete'}
              </h3>

              {!completenessCheck.isComplete && (
                <div className="mt-2 text-sm">
                  {completenessCheck.missingAngles.length > 0 && (
                    <p>
                      <span className="font-medium">Missing angles:</span>{' '}
                      {completenessCheck.missingAngles.join(', ')}
                    </p>
                  )}

                  {completenessCheck.missingTypes.length > 0 && (
                    <p>
                      <span className="font-medium">Missing types:</span>{' '}
                      {completenessCheck.missingTypes.join(', ')}
                    </p>
                  )}

                  {completenessCheck.recommendations.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium">Recommendations:</span>
                      <ul className="list-disc list-inside mt-1">
                        {completenessCheck.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Media uploader */}
      {media.length > 0 || uploadingMedia.length > 0 ? (
        <MediaUploader
          mediaFiles={[...mediaFilesForUploader, ...uploadingMedia]}
          onMediaAdd={handleMediaAdd}
          onMediaRemove={(mediaId) => {
            const mediaItem = media.find((m) => m.id === mediaId);
            if (mediaItem) confirmDelete(mediaItem);
          }}
          onSetPrimary={handleSetPrimary}
          onUpdateViewAngle={handleUpdateViewAngle}
          allowedTypes={['image', 'video', 'svg']}
          viewAngleRequired={true}
        />
      ) : (
        <EmptyState
          icon={<Video className="h-12 w-12 text-gray-400" />}
          title="No media"
          description="Add videos, images, or SVGs to demonstrate this exercise from different angles."
          action={
            <div className="space-y-3">
              <MediaUploader
                mediaFiles={[]}
                onMediaAdd={handleMediaAdd}
                onMediaRemove={() => {}}
                onSetPrimary={() => {}}
                onUpdateViewAngle={() => {}}
                allowedTypes={['image', 'video', 'svg']}
                viewAngleRequired={true}
              />

              <div className="text-xs text-gray-500 text-center">
                <p>Supported formats: JPG, PNG, SVG, MP4, WebM</p>
                <p>For best results, upload media from multiple angles</p>
              </div>
            </div>
          }
        />
      )}

      {/* Media stats and tips */}
      {media.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <LifeBuoy className="h-4 w-4 mr-2 text-gray-500" />
            Media Tips
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-1">
                Media count by type
              </h4>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <ImageIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm">
                    {media.filter((m) => m.mediaType === 'IMAGE').length} Images
                  </span>
                </div>
                <div className="flex items-center">
                  <Video className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm">
                    {media.filter((m) => m.mediaType === 'VIDEO').length} Videos
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-1">
                View angle coverage
              </h4>
              <div className="flex flex-wrap gap-2">
                {['FRONT', 'SIDE', 'REAR', 'ANGLE'].map((angle) => {
                  const hasAngle = media.some((m) => m.viewAngle === angle);
                  return (
                    <div
                      key={angle}
                      className={`text-xs px-2 py-1 rounded-full flex items-center ${
                        hasAngle
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {hasAngle ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {angle.charAt(0) + angle.slice(1).toLowerCase()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedMedia(null);
        }}
        onConfirm={handleMediaRemove}
        title="Remove Media"
        message={
          <p>
            Are you sure you want to remove this{' '}
            {selectedMedia?.mediaType.toLowerCase()}? This action cannot be
            undone.
          </p>
        }
        confirmText="Remove"
        type="danger"
      />
    </div>
  );
};

export default ExerciseMedia;
