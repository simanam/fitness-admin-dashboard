// src/components/media/MediaUploader.tsx
import { useState } from 'react';
import {
  Upload,
  X,
  Image as ImageIcon,
  FileVideo,
  Plus,
  Trash2,
  AlertTriangle,
  FileImage,
} from 'lucide-react';
import { FileUpload } from '../ui/file-upload';
import { cn } from '../../lib/utils';

export interface MediaFile {
  id?: string;
  file?: File;
  url: string;
  type: 'image' | 'video' | 'svg';
  name: string;
  size: number;
  progress?: number;
  status?: 'uploading' | 'success' | 'error';
  viewAngle?: 'front' | 'side' | 'rear' | 'angle';
  isPrimary?: boolean;
}

export interface MediaUploaderProps {
  mediaFiles: MediaFile[];
  onMediaAdd: (file: File, viewAngle?: string) => void;
  onMediaRemove: (mediaId: string) => void;
  onSetPrimary: (mediaId: string) => void;
  onUpdateViewAngle: (mediaId: string, viewAngle: string) => void;
  className?: string;
  maxFiles?: number;
  allowedTypes?: ('image' | 'video' | 'svg')[];
  viewAngleRequired?: boolean;
}

export function MediaUploader({
  mediaFiles,
  onMediaAdd,
  onMediaRemove,
  onSetPrimary,
  onUpdateViewAngle,
  className,
  maxFiles = 10,
  allowedTypes = ['image', 'video', 'svg'],
  viewAngleRequired = true,
}: MediaUploaderProps) {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedViewAngle, setSelectedViewAngle] = useState<string>('FRONT');

  const viewAngles = [
    { value: 'front', label: 'Front View' },
    { value: 'side', label: 'Side View' },
    { value: 'rear', label: 'Rear View' },
    { value: 'angle', label: 'Angle View' },
  ];

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleSubmitFile = () => {
    if (selectedFile) {
      onMediaAdd(selectedFile, selectedViewAngle);
      setSelectedFile(null);
      setIsAddMenuOpen(false);
    }
  };

  const getAcceptString = () => {
    const types = [];
    if (allowedTypes.includes('image'))
      types.push('image/jpeg', 'image/png', 'image/gif');
    if (allowedTypes.includes('svg')) types.push('image/svg+xml');
    if (allowedTypes.includes('video')) types.push('video/mp4', 'video/webm');
    return types.join(',');
  };

  const renderMediaPreview = (media: MediaFile) => {
    if (media.type === 'image') {
      return (
        <img
          src={media.url}
          alt={media.name}
          className="h-full w-full object-cover"
        />
      );
    } else if (media.type === 'svg') {
      return (
        <img
          src={media.url}
          alt={media.name}
          className="h-full w-full object-contain p-2"
        />
      );
    } else {
      return (
        <div className="relative h-full w-full bg-gray-100 flex items-center justify-center">
          <FileVideo className="h-10 w-10 text-gray-400" />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 truncate">
            {media.name}
          </div>
        </div>
      );
    }
  };

  const getMediaTypeIcon = (media: MediaFile) => {
    if (media.type === 'video') {
      return <FileVideo className="h-4 w-4" />;
    } else if (media.type === 'svg') {
      return <FileImage className="h-4 w-4" />;
    } else {
      return <ImageIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap gap-4">
        {mediaFiles.map((media) => (
          <div
            key={media.id}
            className={cn(
              'relative group border rounded-lg overflow-hidden h-48 w-48',
              media.isPrimary && 'ring-2 ring-blue-500'
            )}
          >
            {renderMediaPreview(media)}

            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
              <div className="space-y-2">
                {!media.isPrimary && (
                  <button
                    type="button"
                    onClick={() => onSetPrimary(media.id!)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
                  >
                    Set as Primary
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onMediaRemove(media.id!)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </div>

            {media.status === 'uploading' && (
              <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80">
                <div
                  className="h-1 bg-blue-500"
                  style={{ width: `${media.progress}%` }}
                ></div>
                <div className="px-2 py-1 text-xs">{media.progress}%</div>
              </div>
            )}

            {media.status === 'error' && (
              <div className="absolute top-2 right-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
            )}

            {media.isPrimary && (
              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Primary
              </div>
            )}

            <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full flex items-center">
              {getMediaTypeIcon(media)}
              <span className="ml-1">{media.type}</span>
            </div>

            {media.viewAngle && (
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                {media.viewAngle}
              </div>
            )}
          </div>
        ))}

        {mediaFiles.length < maxFiles && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="border-2 border-dashed border-gray-300 rounded-lg h-48 w-48 flex flex-col items-center justify-center hover:border-gray-400"
            >
              <Plus className="h-10 w-10 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">Add Media</span>
            </button>

            {isAddMenuOpen && (
              <div className="absolute left-0 right-0 mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200 z-10 w-72">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium">Add New Media</h3>
                  <button
                    type="button"
                    onClick={() => setIsAddMenuOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <FileUpload
                    accept={getAcceptString()}
                    onFileSelect={handleFileSelect}
                    label="Upload media"
                    helperText={`Supported formats: ${allowedTypes.includes('image') ? 'JPG, PNG, ' : ''}${allowedTypes.includes('svg') ? 'SVG, ' : ''}${allowedTypes.includes('video') ? 'MP4, WebM' : ''}`}
                  />

                  {viewAngleRequired && selectedFile && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        View Angle
                      </label>
                      <select
                        value={selectedViewAngle}
                        onChange={(e) => setSelectedViewAngle(e.target.value)}
                        className="w-full rounded-md border border-gray-300 py-2 px-3"
                      >
                        {viewAngles.map((angle) => (
                          <option key={angle.value} value={angle.value}>
                            {angle.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsAddMenuOpen(false)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitFile}
                      disabled={!selectedFile}
                      className="px-3 py-2 bg-black text-white rounded-md text-sm disabled:opacity-50"
                    >
                      Upload
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {mediaFiles.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="flex justify-center">
            <Upload className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            No media files uploaded
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Add images, SVGs, and videos to showcase your exercise from
            different angles.
          </p>
          <button
            type="button"
            onClick={() => setIsAddMenuOpen(true)}
            className="mt-4 px-4 py-2 bg-black text-white rounded-md text-sm"
          >
            Upload Media
          </button>
        </div>
      )}

      {viewAngleRequired && (
        <div className="flex flex-wrap gap-2 mt-2">
          {viewAngles.map((angle) => {
            const hasAngle = mediaFiles.some(
              (media) => media.viewAngle === angle.value
            );
            return (
              <div
                key={angle.value}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  hasAngle
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                )}
              >
                {angle.label}
                {hasAngle && ' ✓'}
              </div>
            );
          })}
        </div>
      )}

      {viewAngleRequired && (
        <p className="text-xs text-gray-500">
          For best results, upload media from all angles.
        </p>
      )}
    </div>
  );
}

export default MediaUploader;
