// src/hooks/useMediaManagement.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from './useToast';
import exerciseMediaService, {
  ExerciseMedia,
} from '../api/exerciseMediaService';
import { MediaFile } from '../components/media/MediaUploader';
import { debounce } from 'lodash';

interface UseMediaManagementProps {
  exerciseId: string;
}

export const useMediaManagement = ({ exerciseId }: UseMediaManagementProps) => {
  const { showToast } = useToast();
  const [media, setMedia] = useState<ExerciseMedia[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use useCallback to memoize the fetch function
  const fetchMediaImpl = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const mediaData = await exerciseMediaService.getExerciseMedia(exerciseId);
      setMedia(mediaData);

      // Convert to format for MediaUploader
      const files: MediaFile[] = mediaData.map((item) => ({
        id: item.id,
        url: item.urls?.preview || item.url,
        type: item.mediaType.toLowerCase() as 'image' | 'video' | 'svg',
        name: item.title || `${item.mediaType} ${item.id.slice(0, 6)}`,
        size: 0, // Size info might not be available from API
        viewAngle: item.viewAngle,
        isPrimary: item.isPrimary,
      }));

      setMediaFiles(files);
    } catch (err) {
      console.error('Error fetching media:', err);
      setError('Failed to load media files');
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load media files',
      });
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId, showToast]);

  // Create a debounced version of the fetch function
  const fetchMediaDebounced = useRef(debounce(fetchMediaImpl, 300)).current;

  // Public fetch media function
  const fetchMedia = useCallback(() => {
    fetchMediaDebounced();
  }, [fetchMediaDebounced]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      fetchMediaDebounced.cancel();
    };
  }, [fetchMediaDebounced]);

  // Load media on mount
  useEffect(() => {
    fetchMedia();
  }, [exerciseId, fetchMedia]);

  // Handle media upload
  const uploadMedia = async (file: File, viewAngle?: string) => {
    // Create FormData for upload

    console.log(file, viewAngle, 'file mansb');
    const formData = new FormData();
    formData.append('exerciseId', exerciseId);
    formData.append('file', file);
    const normalizedViewAngle = (viewAngle || 'FRONT').toLowerCase();
    formData.append('viewangle', normalizedViewAngle);
    formData.append(
      'mediaType',
      file.type.startsWith('video')
        ? 'video'
        : file.type === 'image/svg+xml'
          ? 'svg'
          : 'image'
    );

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    formData.append('format', fileExtension || '');

    formData.append('title', file.name);

    // Create temporary media file for UI
    const tempId = `temp-${Date.now()}`;
    const newFile: MediaFile = {
      id: tempId,
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video')
        ? 'video'
        : file.type === 'image/svg+xml'
          ? 'svg'
          : 'image',
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
      viewAngle: (viewAngle as any) || 'front',
    };

    setMediaFiles((prev) => [...prev, newFile]);
    setIsUploading(true);

    try {
      // Upload with progress tracking
      const uploadedMedia = await exerciseMediaService.uploadMedia(
        formData,
        (progress) => {
          setMediaFiles((prev) =>
            prev.map((f) => (f.id === tempId ? { ...f, progress } : f))
          );
        }
      );

      // Update file list with uploaded file details
      setMediaFiles((prev) =>
        prev.map((f) =>
          f.id === tempId
            ? {
                id: uploadedMedia.id,
                url: uploadedMedia.urls?.preview || uploadedMedia.url,
                type: uploadedMedia.mediaType.toLowerCase() as
                  | 'image'
                  | 'video'
                  | 'svg',
                name: uploadedMedia.title || file.name,
                size: file.size,
                status: 'success',
                viewAngle: uploadedMedia.viewAngle,
                isPrimary: uploadedMedia.isPrimary,
              }
            : f
        )
      );

      // Refresh media list from server
      fetchMedia();

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Media uploaded successfully',
      });

      return true;
    } catch (err) {
      console.error('Error uploading media:', err);

      // Update file status to error
      setMediaFiles((prev) =>
        prev.map((f) => (f.id === tempId ? { ...f, status: 'error' } : f))
      );

      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to upload media file',
      });

      return false;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle media removal
  const removeMedia = async (mediaId: string) => {
    // For temporary files being uploaded, just remove from list
    if (mediaId.startsWith('temp-')) {
      setMediaFiles((prev) => prev.filter((f) => f.id !== mediaId));
      return true;
    }

    setIsDeleting(true);
    try {
      await exerciseMediaService.deleteMedia(mediaId);

      // Remove from lists
      setMedia((prev) => prev.filter((m) => m.id !== mediaId));
      setMediaFiles((prev) => prev.filter((f) => f.id !== mediaId));

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Media deleted successfully',
      });

      return true;
    } catch (err) {
      console.error('Error deleting media:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete media file',
      });

      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle setting primary media
  const setPrimaryMedia = async (mediaId: string) => {
    try {
      await exerciseMediaService.setPrimaryMedia(mediaId);

      // Update local state
      setMedia((prev) =>
        prev.map((m) => ({
          ...m,
          isPrimary: m.id === mediaId,
        }))
      );

      setMediaFiles((prev) =>
        prev.map((f) => ({
          ...f,
          isPrimary: f.id === mediaId,
        }))
      );

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Primary media updated',
      });

      return true;
    } catch (err) {
      console.error('Error setting primary media:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update primary media',
      });

      return false;
    }
  };

  // Handle updating view angle
  const updateViewAngle = async (mediaId: string, viewAngle: string) => {
    try {
      await exerciseMediaService.updateMediaViewAngle(mediaId, viewAngle);

      // Update local state
      setMedia((prev) =>
        prev.map((m) =>
          m.id === mediaId ? { ...m, viewAngle: viewAngle as any } : m
        )
      );

      setMediaFiles((prev) =>
        prev.map((f) =>
          f.id === mediaId ? { ...f, viewAngle: viewAngle as any } : f
        )
      );

      showToast({
        type: 'success',
        title: 'Success',
        message: 'View angle updated',
      });

      return true;
    } catch (err) {
      console.error('Error updating view angle:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update view angle',
      });

      return false;
    }
  };

  // Handle reordering media
  const reorderMedia = async (orderData: { id: string; order: number }[]) => {
    try {
      await exerciseMediaService.reorderMedia(exerciseId, orderData);

      // Update local state with new order
      const updatedMedia = [...media];
      orderData.forEach((item) => {
        const mediaItem = updatedMedia.find((m) => m.id === item.id);
        if (mediaItem) {
          mediaItem.order = item.order;
        }
      });

      setMedia(updatedMedia);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Media order updated',
      });

      return true;
    } catch (err) {
      console.error('Error reordering media:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update media order',
      });

      throw err;
    }
  };

  return {
    media,
    mediaFiles,
    isLoading,
    isUploading,
    isDeleting,
    error,
    fetchMedia,
    uploadMedia,
    removeMedia,
    setPrimaryMedia,
    updateViewAngle,
    reorderMedia,
    fetchMediaDebounced, // Expose this for cancellation in cleanup
  };
};

export default useMediaManagement;
