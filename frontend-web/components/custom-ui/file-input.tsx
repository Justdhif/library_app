"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export interface FileInputProps {
  /**
   * Variant menentukan bentuk preview gambar
   * - "circular": Berbentuk lingkaran (untuk avatar/profile photo)
   * - "square": Berbentuk persegi (untuk cover/thumbnail)
   */
  variant?: "circular" | "square";
  
  /**
   * Nilai file yang dipilih
   */
  value?: File | null;
  
  /**
   * Callback ketika file berubah
   */
  onChange?: (file: File | undefined) => void;
  
  /**
   * Callback untuk menghapus file
   */
  onRemove?: () => void;
  
  /**
   * URL preview untuk file yang sudah ada
   */
  previewUrl?: string;
  
  /**
   * ID untuk input file
   */
  id?: string;
  
  /**
   * Label yang ditampilkan pada tombol upload
   */
  label?: string | React.ReactNode;
  
  /**
   * Deskripsi atau hint di bawah tombol upload
   */
  description?: string;
  
  /**
   * Maksimal ukuran file dalam MB
   */
  maxSize?: number;
  
  /**
   * Tipe file yang diterima (default: "image/*")
   */
  accept?: string;
  
  /**
   * Icon fallback untuk circular variant
   */
  fallbackIcon?: React.ReactNode;
  
  /**
   * Status disabled
   */
  disabled?: boolean;
  
  /**
   * Custom className untuk container
   */
  className?: string;
  
  /**
   * Ukuran preview (dalam tailwind class)
   */
  previewSize?: string;
  
  /**
   * Show remove button
   */
  showRemoveButton?: boolean;
  
  /**
   * Custom error handler
   */
  onError?: (message: string) => void;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      variant = "circular",
      value,
      onChange,
      onRemove,
      previewUrl,
      id = "file-input",
      label = "Choose File",
      description = "Max 5MB (JPG, PNG, GIF)",
      maxSize = 5, // in MB
      accept = "image/*",
      fallbackIcon,
      disabled = false,
      className,
      previewSize,
      showRemoveButton = true,
      onError,
    },
    ref
  ) => {
    const [preview, setPreview] = React.useState<string | null>(null);
    const [isMounted, setIsMounted] = React.useState(false);

    // Handle client-side mounting to avoid hydration mismatch
    React.useEffect(() => {
      setIsMounted(true);
    }, []);

    React.useEffect(() => {
      if (!isMounted) return;
      
      if (value) {
        const objectUrl = URL.createObjectURL(value);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      } else if (previewUrl) {
        setPreview(previewUrl);
      } else {
        setPreview(null);
      }
    }, [value, previewUrl, isMounted]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validasi ukuran file
        if (file.size > maxSize * 1024 * 1024) {
          const errorMessage = `Ukuran file terlalu besar. Maksimal ${maxSize}MB`;
          if (onError) {
            onError(errorMessage);
          } else {
            alert(errorMessage);
          }
          return;
        }

        // Validasi tipe file
        if (accept === "image/*" && !file.type.startsWith("image/")) {
          const errorMessage = "File harus berupa gambar";
          if (onError) {
            onError(errorMessage);
          } else {
            alert(errorMessage);
          }
          return;
        }

        onChange?.(file);
      }
    };

    const handleRemove = () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
      setPreview(null);
      onChange?.(undefined);
      onRemove?.();
    };

    // Show fallback during SSR to prevent hydration mismatch
    if (!isMounted) {
      if (variant === "circular") {
        return (
          <div className={cn("flex flex-col items-center space-y-4", className)}>
            <Avatar
              className={cn(
                "border-4 border-emerald-200 shadow-lg",
                previewSize || "w-40 h-40"
              )}
            >
              <AvatarFallback className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30">
                {fallbackIcon}
              </AvatarFallback>
            </Avatar>
            <div className="w-full space-y-2">
              <div className="flex items-center justify-center gap-2 w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium">
                <Upload className="w-4 h-4" />
                {label}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {description}
              </p>
            </div>
          </div>
        );
      } else {
        return (
          <div className={cn("space-y-4", className)}>
            <div
              className={cn(
                "relative overflow-hidden rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 shadow-lg",
                previewSize || "w-full aspect-[3/4]"
              )}
            >
              <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                {fallbackIcon}
              </div>
            </div>
            <div className="w-full space-y-2">
              <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg border-2 border-dashed border-emerald-300 dark:border-emerald-700">
                <Upload className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  {label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {description}
              </p>
            </div>
          </div>
        );
      }
    }

    // Circular variant (untuk avatar/profile photo)
    if (variant === "circular") {
      return (
        <div className={cn("flex flex-col items-center space-y-4", className)}>
          <Avatar
            className={cn(
              "border-4 border-emerald-200 shadow-lg",
              previewSize || "w-40 h-40"
            )}
          >
            {preview ? (
              <AvatarImage
                src={preview}
                alt="Preview"
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30">
                {fallbackIcon}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="w-full space-y-2">
            <Input
              ref={ref}
              type="file"
              id={id}
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
              disabled={disabled}
            />
            <Label
              htmlFor={id}
              className={cn(
                "flex items-center justify-center gap-2 w-full cursor-pointer rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <Upload className="w-4 h-4" />
              {label}
            </Label>
            {showRemoveButton && preview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="w-4 h-4 mr-2" />
                Hapus
              </Button>
            )}
            <p className="text-xs text-muted-foreground text-center">
              {description}
            </p>
          </div>
        </div>
      );
    }

    // Square variant (untuk cover/thumbnail)
    return (
      <div className={cn("space-y-4", className)}>
        <div
          className={cn(
            "relative overflow-hidden rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 shadow-lg",
            previewSize || "w-full aspect-[3/4]"
          )}
        >
          {preview ? (
            <Image
              src={preview}
              alt="Cover preview"
              fill
              className="object-cover z-10"
              priority
            />
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              {fallbackIcon}
            </div>
          )}
        </div>

        <div className="w-full space-y-2">
          <Label
            htmlFor={id}
            className={cn(
              "flex items-center justify-center gap-2 cursor-pointer w-full py-3 px-4 bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-900/70 rounded-lg transition-colors border-2 border-dashed border-emerald-300 dark:border-emerald-700",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <Upload className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              {label}
            </span>
          </Label>
          <Input
            ref={ref}
            id={id}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled}
          />
          {showRemoveButton && (value || preview) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="w-4 h-4 mr-2" />
              Hapus
            </Button>
          )}
          <p className="text-xs text-muted-foreground text-center">
            {description}
          </p>
        </div>
      </div>
    );
  }
);

FileInput.displayName = "FileInput";

export { FileInput };
