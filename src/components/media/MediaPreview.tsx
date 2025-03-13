// src/components/media/MediaPreview.tsx
import { useState, useEffect, useRef } from 'react';
import { Star, Trash2, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { ExerciseMedia } from '../../api/exerciseMediaService';
import { cn } from '../../lib/utils';

interface MediaPreviewProps {
  media: ExerciseMedia;
  onSetPrimary?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  className?: string;
}

const MediaPreview = ({
  media,
  onSetPrimary,
  onDelete,
  className,
}: MediaPreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle video playback
  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => {
        console.error('Error playing video:', err);
        setError('Error playing video. It may be unsupported by your browser.');
      });
    }
  };

  // Handle video mute/unmute
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Set up video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      setError('Error loading video. The format may be unsupported.');
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Media display */}
      <div className="relative rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center min-h-[300px]">
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70 z-10">
            <div className="w-10 h-10 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-90 z-10">
            <div className="text-red-600 text-center p-4">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Media content */}
        {media.mediaType === 'VIDEO' && (
          <div className="relative w-full">
            <video
              ref={videoRef}
              src={media.urls?.fullsize || media.url}
              poster={media.urls?.thumbnail}
              className="w-full h-auto max-h-[70vh]"
              controls={false}
              preload="auto"
              onLoadStart={() => setIsLoading(true)}
            />

            {/* Video controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-gray-200 focus:outline-none"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-gray-200 focus:outline-none"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                </div>

                <div className="text-white text-sm">
                  {media.duration ? `${media.duration.toFixed(1)}s` : ''}
                </div>
              </div>
            </div>
          </div>
        )}

        {media.mediaType === 'IMAGE' && (
          <img
            src={media.urls?.fullsize || media.url}
            alt={media.title || 'Exercise image'}
            className="max-w-full max-h-[70vh] object-contain"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError('Error loading image');
            }}
          />
        )}

        {media.mediaType === 'SVG' && (
          <img
            src={media.url}
            alt={media.title || 'Exercise SVG'}
            className="max-w-full max-h-[70vh] object-contain p-4"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError('Error loading SVG');
            }}
          />
        )}
      </div>

      {/* Media details */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap justify-between">
          <div>
            <h3 className="font-medium">
              {media.title || `${media.mediaType} ${media.id.slice(0, 6)}`}
            </h3>
            <div className="flex items-center mt-1 text-sm text-gray-500 space-x-4">
              <div className="flex items-center space-x-1">
                <span
                  className={cn(
                    'inline-block w-2 h-2 rounded-full',
                    media.mediaType === 'VIDEO'
                      ? 'bg-purple-500'
                      : media.mediaType === 'IMAGE'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                  )}
                ></span>
                <span>{media.mediaType}</span>
              </div>

              <div>
                View: <span className="font-medium">{media.viewAngle}</span>
              </div>

              {media.duration && (
                <div>
                  Duration:{' '}
                  <span className="font-medium">
                    {media.duration.toFixed(1)}s
                  </span>
                </div>
              )}

              {media.format && (
                <div>
                  Format: <span className="font-medium">{media.format}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-2 mt-2 sm:mt-0">
            {!media.isPrimary && onSetPrimary && (
              <button
                onClick={onSetPrimary}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <Star size={16} className="mr-1.5" />
                Set as Primary
              </button>
            )}

            {onDelete && (
              <button
                onClick={onDelete}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100"
              >
                <Trash2 size={16} className="mr-1.5" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPreview;
