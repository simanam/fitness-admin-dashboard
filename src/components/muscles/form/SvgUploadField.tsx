// src/components/muscles/form/SvgUploadField.tsx
import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Layers, Eye, EyeOff } from 'lucide-react';
import { FileUpload } from '../../ui/file-upload';
import apiClient from '../../../api/client';
import FormField from '../../exercises/form/FormField';

interface SvgUploadFieldProps {
  muscleId?: string;
}

const SvgUploadField: React.FC<SvgUploadFieldProps> = ({ muscleId }) => {
  const { register, setValue, trigger, watch } = useFormContext();
  const keepExistingSvg = watch('keepExistingSvg');

  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isLoadingSvg, setIsLoadingSvg] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [newSvgPreview, setNewSvgPreview] = useState<string | null>(null);

  // Fetch existing SVG if available
  useEffect(() => {
    if (!muscleId) return;

    const fetchSvg = async () => {
      setIsLoadingSvg(true);

      try {
        const response = await apiClient.get(`/muscles/${muscleId}/svg`);

        if (response.data) {
          setSvgContent(response.data);
          // Default to keeping existing SVG
          setValue('keepExistingSvg', true);
        } else {
          setSvgContent(null);
          setValue('keepExistingSvg', false);
        }
      } catch (error) {
        console.error('Error fetching muscle SVG:', error);
        setSvgContent(null);
        setValue('keepExistingSvg', false);
      } finally {
        setIsLoadingSvg(false);
      }
    };

    fetchSvg();
  }, [muscleId, setValue]);

  // Process SVG to ensure it displays properly
  const processSvg = (svgString: string) => {
    // Add preserveAspectRatio and width/height if not present
    let processedContent = svgString;

    // If the SVG doesn't have width/height set to 100%, add it
    if (!processedContent.includes('width="100%"')) {
      processedContent = processedContent.replace(
        '<svg',
        '<svg width="100%" height="100%"'
      );
    }

    // Ensure preserveAspectRatio is set correctly
    if (!processedContent.includes('preserveAspectRatio')) {
      processedContent = processedContent.replace(
        '<svg',
        '<svg preserveAspectRatio="xMidYMid meet"'
      );
    }

    return processedContent;
  };

  const handleFileSelect = (file: File) => {
    setValue('svgFile', file);
    trigger('svgFile');

    // If we're adding a new file, set keepExistingSvg to false
    setValue('keepExistingSvg', false);

    // Create preview for the new file
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setNewSvgPreview(e.target.result as string);
        }
      };
      reader.readAsText(file);
    } else {
      setNewSvgPreview(null);
    }
  };

  const handleRemoveFile = () => {
    setValue('svgFile', undefined);
    setNewSvgPreview(null);

    // If there's an existing SVG, default back to using it
    if (svgContent) {
      setValue('keepExistingSvg', true);
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleToggleKeepExisting = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setValue('keepExistingSvg', checked);

    // If we're toggling back to keep existing, and there's a new file selected, clear it
    if (checked) {
      setValue('svgFile', undefined);
      setNewSvgPreview(null);
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        name="svgFile"
        label="Muscle Visualization (SVG)"
        helperText="Upload an SVG illustration of the muscle"
      >
        <div className="space-y-4">
          {/* Toggle for existing SVG if available */}
          {muscleId && svgContent && (
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="keepExistingSvg"
                checked={keepExistingSvg}
                onChange={handleToggleKeepExisting}
                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                {...register('keepExistingSvg')}
              />
              <label
                htmlFor="keepExistingSvg"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                Keep existing SVG visualization
              </label>
            </div>
          )}

          {/* File upload component (shown if no existing SVG or if not keeping existing) */}
          {(!muscleId || !svgContent || !keepExistingSvg) && (
            <FileUpload
              accept=".svg,image/svg+xml"
              maxSize={2} // 2MB max size
              onFileSelect={handleFileSelect}
              onFileRemove={handleRemoveFile}
              label={muscleId ? 'Upload new SVG' : 'Upload SVG'}
              helperText="Upload an SVG file for muscle visualization. Max size 2MB."
              showPreview={false}
            />
          )}

          {/* Preview section with toggle */}
          {((svgContent && keepExistingSvg) || newSvgPreview) && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700">Preview</h4>
                <button
                  type="button"
                  onClick={togglePreview}
                  className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700"
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Hide Preview
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Show Preview
                    </>
                  )}
                </button>
              </div>

              {showPreview && (
                <div className="border border-gray-200 rounded-lg bg-gray-50 p-4">
                  <div className="w-full max-w-md mx-auto aspect-square">
                    {isLoadingSvg ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                        <p>Loading visualization...</p>
                      </div>
                    ) : newSvgPreview ? (
                      <div className="flex items-center justify-center h-full">
                        <div
                          className="w-full h-full"
                          dangerouslySetInnerHTML={{
                            __html: processSvg(newSvgPreview),
                          }}
                        />
                      </div>
                    ) : svgContent && keepExistingSvg ? (
                      <div className="flex items-center justify-center h-full">
                        <div
                          className="w-full h-full"
                          dangerouslySetInnerHTML={{
                            __html: processSvg(svgContent),
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <Layers className="h-10 w-10 text-gray-300 mb-2" />
                        <p>No preview available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </FormField>
    </div>
  );
};

export default SvgUploadField;
