"use client";

import { useState, useRef, useCallback, useEffect } from "react";



interface UploadZoneProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onImageSelect, disabled }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (disabled) return;
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/bmp",
      ];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a valid image file (JPEG, PNG, WebP, GIF, BMP)");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("File too large. Maximum size is 10MB.");
        return;
      }

      const url = URL.createObjectURL(file);
      setPreview(url);
      onImageSelect(file);
    },
    [onImageSelect, disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled) fileInputRef.current?.click();
  }, [disabled]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // Paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFile, disabled]);

  return (
    <div className="w-full">
      <div
        className={`upload-zone ${isDragOver ? "drag-over" : ""}`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? "none" : "auto",
          padding: preview ? "16px" : "48px 32px",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
          onChange={handleInputChange}
          className="hidden"
        />

        {preview ? (
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative rounded-lg overflow-hidden"
              style={{
                border: "1px solid var(--border)",
                maxHeight: "300px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Uploaded product photo preview"
                className="max-h-[300px] object-contain"
              />
            </div>
            <p
              className="text-sm"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Click or drop to replace
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            {/* Text */}
            <div className="text-center">
              <p
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Drop an image here or click to upload
              </p>
              <p
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Supports JPEG, PNG, WebP, GIF, BMP (max 10MB)
              </p>
            </div>

            {/* Action hints */}
            <div className="flex items-center gap-4">
              <div
                className="px-3 py-1.5 rounded-md text-xs"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Drag & Drop
              </div>
              <div
                className="px-3 py-1.5 rounded-md text-xs"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Ctrl+V to Paste
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
