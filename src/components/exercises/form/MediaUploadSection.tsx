// src/components/exercises/form/MediaUploadSection.tsx
import React, { useState } from 'react';
import {
  Upload,
  X,
  Check,
  FileVideo,
  Image as ImageIcon,
  Info,
} from 'lucide-react';
import { FileUpload } from '../../ui/file-upload';
import { Select } from '../../ui/select';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Checkbox } from '../../ui/checkbox';

interface MediaUploadSectionProps {
  onAddMedia: (file: File, metadata: any) => void;
  onRemoveMedia: (index: number) => void;
  mediaFiles: File[];
}

const MediaUploadSection: React.FC<MediaUploadSectionProps> = ({
  onAddMedia,
  onRemoveMedia,
  mediaFiles,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewAngle, setViewAngle] = useState<string>('front');
  const [isPrimary, setIsPrimary] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Get view angles from backend docs
  const viewAngles = [
    { value: 'front', label: 'Front View' },
    { value: 'back', label: 'Back View' },
    { value: 'side', label: 'Side View' },
    { value: 'diagonal', label: 'Diagonal View' },
    { value: '45-degree', label: '45° Angle View' },
  ];

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);

    // Create preview URL for the file
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleAddMedia = () => {
    if (!selectedFile) return;

    const mediaType = selectedFile.type.startsWith('video/')
      ? 'video'
      : 'image';

    // Create metadata for the file
    const metadata = {
      mediaType,
      viewAngle,
      isPrimary,
      title: title || selectedFile.name,
      description,
      format: selectedFile.name.split('.').pop()?.toLowerCase(),
    };
    console.log(selectedFile, metadata, 'u[lpoadseciotn');

    onAddMedia(selectedFile, metadata);
    resetForm();
  };

  const resetForm = () => {
    setSelectedFile(null);
    setViewAngle('front');
    setIsPrimary(false);
    setTitle('');
    setDescription('');

    // Clean up any object URLs to avoid memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const getFileType = (file: File): string => {
    if (file.type.startsWith('video/')) return 'video';
    if (file.type === 'image/svg+xml') return 'svg';
    return 'image';
  };

  return (
    <div className="space-y-8">
      {/* Media upload form */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Media</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FileUpload
              accept="video/mp4,video/webm,image/jpeg,image/png,image/svg+xml"
              maxSize={50} // 50MB limit
              onFileSelect={handleFileSelect}
              showPreview={true}
              label="Upload media file"
              helperText="Supported formats: JPG, PNG, SVG, MP4, WebM"
            />
          </div>

          {selectedFile && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  View Angle
                </label>
                <Select
                  value={viewAngle}
                  onChange={(e) => setViewAngle(e.target.value)}
                >
                  {viewAngles.map((angle) => (
                    <option key={angle.value} value={angle.value}>
                      {angle.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (optional)
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Media title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Media description"
                  rows={2}
                />
              </div>

              <div>
                <Checkbox
                  id="isPrimary"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  label="Set as primary media"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddMedia}
                  className="px-3 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800"
                >
                  Add Media
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media list */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Media Files ({mediaFiles.length})
        </h3>

        {mediaFiles.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
            <Upload className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-gray-500">No media files added yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Add images and videos to demonstrate the exercise from different
              angles
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaFiles.map((file, index) => (
              <div
                key={index}
                className="border rounded-lg overflow-hidden group relative"
              >
                {/* Preview container */}
                <div className="h-40 bg-gray-100 flex items-center justify-center">
                  {getFileType(file) === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <FileVideo className="h-10 w-10 text-gray-400" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getFileType(file).toUpperCase()} •{' '}
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>

                {/* Delete overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onRemoveMedia(index)}
                    className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media completeness guide */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-md font-medium text-blue-800 mb-2">
              Media Requirements
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
              <li>Add at least one primary media file (image or video)</li>
              <li>For best results, include media from different angles</li>
              <li>
                Videos should clearly demonstrate the full exercise movement
              </li>
              <li>
                Ensure good lighting and clear visibility of the exercise form
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaUploadSection;
