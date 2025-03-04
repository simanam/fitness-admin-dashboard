// src/components/ui/file-upload.tsx
import { useState, useRef, ChangeEvent } from 'react';
import {
  Upload,
  X,
  Play,
  Pause,
  FileVideo,
  Check,
  AlertCircle,
  FileImage,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  className?: string;
  label?: string;
  error?: string;
  helperText?: string;
  showPreview?: boolean;
  uploadProgress?: number;
  isUploading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  disabled?: boolean;
}

export function FileUpload({
  accept = 'video/*,image/*,image/svg+xml',
  maxSize = 100,
  onFileSelect,
  onFileRemove,
  className,
  label = 'Upload file',
  error,
  helperText,
  showPreview = true,
  uploadProgress = 0,
  isUploading = false,
  isSuccess = false,
  isError = false,
  disabled = false,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    handleFile(selectedFile);
  };

  const handleFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    // File size validation (convert maxSize from MB to bytes)
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setFile(null);
      setPreviewUrl(null);
      if (error) {
        console.error(`File size exceeds the ${maxSize}MB limit.`);
      }
      return;
    }

    setFile(selectedFile);
    onFileSelect(selectedFile);

    // Create preview URL for video or image
    if (showPreview) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleRemove = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileRemove) {
      onFileRemove();
    }
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="h-10 w-10 text-gray-400 mb-2" />;

    if (file.type.startsWith('video/')) {
      return <FileVideo className="h-5 w-5 text-gray-500 mr-2" />;
    } else if (file.type === 'image/svg+xml') {
      return <FileImage className="h-5 w-5 text-gray-500 mr-2" />;
    } else if (file.type.startsWith('image/')) {
      return <FileImage className="h-5 w-5 text-gray-500 mr-2" />;
    }

    return <FileImage className="h-5 w-5 text-gray-500 mr-2" />;
  };

  const renderPreview = () => {
    if (!previewUrl || !file) return null;

    if (file.type.startsWith('video/')) {
      return (
        <div className="mt-4 relative rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={previewUrl}
            className="w-full h-auto rounded-lg"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            controls={false}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              className="bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-90 transition-all"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-gray-900" />
              ) : (
                <Play className="h-6 w-6 text-gray-900" />
              )}
            </button>
          </div>
        </div>
      );
    } else if (
      file.type === 'image/svg+xml' ||
      file.type.startsWith('image/')
    ) {
      return (
        <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-auto max-h-64 object-contain"
          />
        </div>
      );
    }

    return null;
  };

  const getAcceptDescription = () => {
    const acceptTypes = accept.split(',');
    const hasImages = acceptTypes.some(
      (t) => t.includes('image/') && t !== 'image/svg+xml'
    );
    const hasVideos = acceptTypes.some((t) => t.includes('video/'));
    const hasSvg = acceptTypes.some((t) => t === 'image/svg+xml');

    const types = [];
    if (hasImages) types.push('Image (JPG, PNG)');
    if (hasSvg) types.push('SVG');
    if (hasVideos) types.push('Video (MP4, WebM)');

    return types.join(', ');
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-4 transition-colors',
          isDragging ? 'border-gray-500 bg-gray-50' : 'border-gray-300',
          error || isError ? 'border-red-300' : '',
          isSuccess ? 'border-green-300' : '',
          disabled
            ? 'opacity-60 cursor-not-allowed bg-gray-50'
            : 'cursor-pointer'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && !file && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
          disabled={disabled}
        />

        {!file && (
          <div className="flex flex-col items-center justify-center py-4">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {`Supported formats: ${getAcceptDescription()} (Max size: ${maxSize}MB)`}
            </p>
          </div>
        )}

        {file && (
          <div className="mt-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {getFileIcon()}
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {file.name}
                  </span>
                  <p className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)}MB
                  </p>
                </div>
              </div>

              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {isUploading && (
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {isSuccess && (
              <div className="flex items-center mt-2 text-green-500">
                <Check className="h-4 w-4 mr-1" />
                <span className="text-xs">Upload complete</span>
              </div>
            )}

            {isError && !error && (
              <div className="flex items-center mt-2 text-red-500">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="text-xs">Upload failed</span>
              </div>
            )}
          </div>
        )}
      </div>

      {showPreview && renderPreview()}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

export default FileUpload;
