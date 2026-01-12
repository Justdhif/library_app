'use client';

import * as React from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  value?: File | string;
  onChange?: (file: File | undefined) => void;
  accept?: string;
  maxSize?: number; // in MB
  preview?: boolean;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  value,
  onChange,
  accept = 'image/*',
  maxSize = 5,
  preview = true,
  className,
  disabled = false,
}: FileUploadProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof value === 'string' && value) {
      setPreviewUrl(value);
    } else {
      setPreviewUrl('');
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError('');

    if (!file) return;

    // Validate file size
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      setError('Invalid file type');
      return;
    }

    onChange?.(file);
  };

  const handleRemove = () => {
    setPreviewUrl('');
    setError('');
    onChange?.(undefined);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {previewUrl && preview ? (
        <div className="relative group">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-border">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-32 border-2 border-dashed hover:border-primary"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            {accept.includes('image') ? (
              <ImageIcon className="h-8 w-8" />
            ) : (
              <Upload className="h-8 w-8" />
            )}
            <div className="text-sm">
              <span className="font-semibold text-primary">Click to upload</span>
              {' or drag and drop'}
            </div>
            <div className="text-xs">
              {accept} (Max {maxSize}MB)
            </div>
          </div>
        </Button>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
