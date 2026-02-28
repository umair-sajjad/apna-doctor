"use client";

import { useState } from "react";
import { toast } from "sonner";

interface FileUploadProps {
  label: string;
  type:
    | "profile_photo"
    | "pmdc_certificate"
    | "degree_certificate"
    | "experience_certificate";
  currentUrl?: string;
  onUploadComplete: (url: string) => void;
  accept?: string;
  required?: boolean;
}

export default function FileUpload({
  label,
  type,
  currentUrl,
  onUploadComplete,
  accept = "image/*,application/pdf",
  required = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl || "");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setPreviewUrl(data.url);
      onUploadComplete(data.url);
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const isPDF =
    previewUrl &&
    (previewUrl.includes(".pdf") || previewUrl.includes("application/pdf"));

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-black">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="space-y-3">
        {/* Preview */}
        {previewUrl && (
          <div className="relative w-full">
            {isPDF ? (
              <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-gray-50 p-4">
                <svg
                  className="h-12 w-12 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                  <path d="M14 2v6h6M10 13h4M10 17h4M10 9h1" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">PDF Document</p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View Document
                  </a>
                </div>
              </div>
            ) : (
              <div className="relative inline-block">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-w-xs rounded-lg border border-gray-300 shadow-sm"
                />
                {type === "profile_photo" && (
                  <div className="absolute top-2 right-2 rounded bg-green-500 px-2 py-1 text-xs text-white">
                    ✓ Uploaded
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Upload Button */}
        <div>
          <input
            type="file"
            id={`file-${type}`}
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <label
            htmlFor={`file-${type}`}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              uploading
                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {uploading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span>{previewUrl ? "Change File" : "Upload File"}</span>
              </>
            )}
          </label>
          <p className="mt-1 text-xs text-gray-500">
            Max 5MB.{" "}
            {accept === "image/*"
              ? "Images only (JPG, PNG, GIF)"
              : "Images or PDF"}
          </p>
        </div>
      </div>
    </div>
  );
}
