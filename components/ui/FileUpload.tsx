// components/ui/FileUpload.tsx
'use client';

import React, { 
  useState, 
  useRef, 
  forwardRef, 
  ForwardRefRenderFunction 
} from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  multiple?: boolean;
  accept?: string;
  onUpload?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

const FileUploadComponent: ForwardRefRenderFunction<HTMLDivElement, FileUploadProps> = 
(
  {
    label = "Upload Files",
    multiple = false,
    accept = "image/*",
    onUpload,
    className,
    maxFiles = 5,
    maxSize = 5 * 1024 * 1024, // 5MB default
    ...props
  }, 
  ref
) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]): File[] => {
    setErrors([]); // Reset errors
    const validatedFiles: File[] = [];
    const newErrors: string[] = [];

    files.forEach((file, index) => {
      // Check file count
      if (index >= maxFiles) {
        newErrors.push(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Check file size
      if (file.size > maxSize) {
        newErrors.push(`${file.name} exceeds maximum file size`);
        return;
      }

      validatedFiles.push(file);
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
    }

    return validatedFiles;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const validFiles = validateFiles(fileArray);
      
      if (validFiles.length > 0) {
        // Generate previews
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);

        // Call upload handler
        onUpload?.(validFiles);
      }
    }
  };

  const removePreview = (indexToRemove: number) => {
    setPreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div {...props} ref={ref} className={cn("space-y-2", className)}>
      {label && <label className="block mb-2 text-sm font-medium">{label}</label>}
      
      <div 
        className={cn(
          "border-2 border-dashed border-gray-300 rounded-lg p-6",
          "text-center cursor-pointer hover:border-wrench-accent",
          "transition-colors duration-200"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple={multiple}
          accept={accept}
          className="hidden"
        />
        <div className="flex flex-col items-center">
          <Upload className="h-10 w-10 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600">
            Drag and drop files or click to upload
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Max {maxFiles} files, {maxSize / 1024 / 1024}MB each
          </p>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="text-red-600 text-sm space-y-1">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              {/* <img 
                src={preview} 
                alt={`Preview ${index + 1}`} 
                className="w-full h-24 object-cover rounded-lg"
              /> */}
              <button
                type="button"
                onClick={() => removePreview(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Create a forwardRef version of the component
export const FileUpload = forwardRef(FileUploadComponent);

// Add display name
FileUpload.displayName = 'FileUpload';

export default FileUpload;