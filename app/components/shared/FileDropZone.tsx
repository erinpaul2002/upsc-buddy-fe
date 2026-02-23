'use client';

import React, { useCallback, useRef, useState, type ReactNode } from 'react';

interface FileDropZoneProps {
  onFile: (file: File) => void;
  accept?: string;
  label?: string;
  sublabel?: string;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

export default function FileDropZone({
  onFile,
  accept = 'image/*,image/heif,image/heic,image/webp,image/tiff,image/bmp,application/pdf',
  label = 'Drop file here',
  sublabel = 'or click to browse',
  disabled = false,
  className = '',
  children,
}: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile, disabled],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`cursor-pointer transition-all duration-200 ${isDragOver ? 'ring-2 ring-blue-400 scale-[1.01]' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      {children || (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs opacity-60">{sublabel}</p>
        </div>
      )}
    </div>
  );
}
