// src/components/exercises/form/MediaSection.tsx
// This section allows users to upload and manage media for exercises

import { useState, useEffect, type FC } from 'react';

import { AlertTriangle, Camera, Upload } from 'lucide-react';
import { FORM_SECTIONS } from '../../../types/exerciseFormTypes';
import MediaUploader, {
  type MediaFile,
  type ViewAngle,
  isViewAngle,
} from '../../../components/media/MediaUploader';
import { useToast } from '../../../hooks/useToast';
import exerciseMediaService from '../../../api/exerciseMediaService';

interface MediaSectionProps {
  exerciseId?: string;
}

const MediaSection: FC<MediaSectionProps> = ({ exerciseId }) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(Boolean(exerciseId));
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState<MediaFile[]>([]);
  const [completenessCheck, setCompletenessCheck] = useState<{
    isComplete: boolean;
    missingAngles: string[];
    missingTypes: string[];
    recommendations: string[];
  } | null>(null);

  // Fetch existing media if editing an exercise
  useEffect(() => {
    if (!exerciseId) {
      setIsLoading(false);
      return;
    }

    const fetchMedia = async () => {
      try {
        // Fetch media and completeness check
        const [mediaData, completenessData] = await Promise.all([
          exerciseMediaService.getExerciseMedia(exerciseId),
          exerciseMediaService.checkMediaCompleteness(exerciseId),
        ]);

        // Convert API media objects to MediaFile format for the uploader component
        const media: MediaFile[] = mediaData.map((m) => ({
          id: m.id,
          url: m.url || '',
          type: m.mediaType.toLowerCase() as 'image' | 'video' | 'svg',
          name: m.title || `${m.mediaType} - ${m.viewAngle}`,
          size: 0, // Size isn't typically returned from the API
          viewAngle: m.viewAngle,
          isPrimary: m.isPrimary,
        }));

        setMediaFiles(media);
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

    fetchMedia();
  }, [exerciseId, showToast]);

  // Handle media upload
  const handleMediaAdd = async (file: File, viewAngle?: ViewAngle) => {
    // This is only for preview before the exercise is created
    if (!exerciseId) {
      const newMediaFile: MediaFile = {
        id: `temp-${Date.now()}`,
        file,
        url: URL.createObjectURL(file),
        type: getMediaTypeFromFile(file),
        name: file.name,
        size: file.size,
        viewAngle: viewAngle,
        status: 'uploading',
      };

      setMediaFiles((prev) => [...prev, newMediaFile]);
      return;
    }

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
      viewAngle: viewAngle,
    };

    setUploadingMedia((prev) => [...prev, newMediaFile]);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('exerciseId', exerciseId);
      formData.append('file', file);
      formData.append('viewAngle', viewAngle || 'front');
      formData.append('mediaType', getMediaTypeFromFile(file).toUpperCase());
      formData.append('title', file.name);

      // Upload with progress tracking
      const uploadedMedia = await exerciseMediaService.uploadMedia(
        formData,
        (progress) => {
          setUploadingMedia((prev) =>
            prev.map((item) =>
              item.id === newMediaFile.id ? { ...item, progress } : item
            )
          );
        }
      );

      // Add the new media to the state
      const newMedia: MediaFile = {
        id: uploadedMedia.id,
        url: uploadedMedia.url || '',
        type: uploadedMedia.mediaType.toLowerCase() as
          | 'image'
          | 'video'
          | 'svg',
        name:
          uploadedMedia.title ||
          `${uploadedMedia.mediaType} - ${uploadedMedia.viewAngle}`,
        size: 0,
        viewAngle: isViewAngle(uploadedMedia.viewAngle)
          ? uploadedMedia.viewAngle
          : 'front',
        isPrimary: uploadedMedia.isPrimary,
        status: 'success',
      };

      setMediaFiles((prev) => [...prev, newMedia]);
      setUploadingMedia((prev) =>
        prev.filter((item) => item.id !== newMediaFile.id)
      );
      URL.revokeObjectURL(newMediaFile.url);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Media uploaded successfully',
      });

      if (exerciseId) {
        const completenessData =
          await exerciseMediaService.checkMediaCompleteness(exerciseId);
        setCompletenessCheck(completenessData);
      }
    } catch (error) {
      console.error('Error uploading media:', error);
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
  const handleMediaDelete = async (mediaId: string) => {
    // If it's a temporary preview file (no exercise ID yet)
    if (!exerciseId || mediaId.startsWith('temp-')) {
      setMediaFiles((prev) => prev.filter((m) => m.id !== mediaId));
      return;
    }

    try {
      // Otherwise, delete from the server
      await exerciseMediaService.deleteMedia(mediaId);

      setMediaFiles((prev) => prev.filter((m) => m.id !== mediaId));

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Media removed successfully',
      });

      // Refresh completeness check
      const completenessData =
        await exerciseMediaService.checkMediaCompleteness(exerciseId);
      setCompletenessCheck(completenessData);
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
    // Can't set primary for temporary files
    if (!exerciseId || mediaId.startsWith('temp-')) {
      setMediaFiles((prev) =>
        prev.map((m) => ({
          ...m,
          isPrimary: m.id === mediaId,
        }))
      );
      return;
    }

    try {
      await exerciseMediaService.setPrimaryMedia(mediaId);

      // Update local state
      setMediaFiles((prev) =>
        prev.map((m) => ({
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
  const handleUpdateViewAngle = async (
    mediaId: string,
    newViewAngle: ViewAngle
  ) => {
    if (!exerciseId || mediaId.startsWith('temp-')) {
      setMediaFiles((prev) =>
        prev.map((m) =>
          m.id === mediaId ? { ...m, viewAngle: newViewAngle } : m
        )
      );
      return;
    }

    try {
      await exerciseMediaService.updateMediaViewAngle(mediaId, newViewAngle);
      setMediaFiles((prev) =>
        prev.map((m) =>
          m.id === mediaId ? { ...m, viewAngle: newViewAngle } : m
        )
      );

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

  // Get the media type from file extension
  const getMediaTypeFromFile = (file: File): 'image' | 'video' | 'svg' => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (file.type === 'image/svg+xml' || extension === 'svg') {
      return 'svg';
    }
    if (
      file.type.startsWith('video/') ||
      ['mp4', 'webm', 'mov'].includes(extension || '')
    ) {
      return 'video';
    }
    return 'image';
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {FORM_SECTIONS.media?.title || 'Media'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {FORM_SECTIONS.media?.description ||
            'Upload images and videos that demonstrate the exercise'}
        </p>
      </div>

      {/* Media completeness info */}
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
              <div className="h-5 w-5 text-green-500 mt-0.5 mr-2">✓</div>
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

                  {completenessCheck.recommendations.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium">Recommendations:</span>
                      <ul className="list-disc list-inside mt-1">
                        {completenessCheck.recommendations.map(
                          (recommendation) => (
                            <li key={`recommendation-${recommendation}`}>
                              {recommendation}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tips for better media uploads */}
      {!completenessCheck && (
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
          <div className="flex">
            <Camera className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Tips for Great Exercise Media
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Upload from different angles (front, side, rear, angle)
                  </li>
                  <li>Include both starting and ending positions</li>
                  <li>Use good lighting with a clean background</li>
                  <li>Videos should be 10-30 seconds showing full movement</li>
                  <li>Set one primary media to represent the exercise</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media uploader */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <MediaUploader
          mediaFiles={[...mediaFiles, ...uploadingMedia]}
          onMediaAdd={handleMediaAdd}
          onMediaDelete={handleMediaDelete}
          onMediaPrimaryChange={handleSetPrimary}
          onUpdateViewAngle={handleUpdateViewAngle}
          allowedTypes={['image', 'video', 'svg']}
          viewAngleRequired={true}
        />

        {mediaFiles.length === 0 && uploadingMedia.length === 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2">No media added yet</p>
            <p>You can add media now, or return to this section later</p>
          </div>
        )}
      </div>

      {/* Notes about media processing */}
      <div className="text-sm text-gray-500">
        <p>
          {exerciseId
            ? 'Media uploads are processed immediately. You can continue editing other sections while uploads complete.'
            : 'Media will be uploaded after the exercise is created. You can add media now for reference.'}
        </p>
      </div>
    </div>
  );
};

export default MediaSection;
