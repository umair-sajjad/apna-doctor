"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";

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
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setPreviewUrl(data.url);
      onUploadComplete(data.url);
      toast.success("File uploaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const isPDF =
    previewUrl &&
    (previewUrl.includes(".pdf") || previewUrl.includes("application/pdf"));

  return (
    <div>
      <label
        className="mb-2 block text-xs font-semibold tracking-wide uppercase"
        style={{ color: "var(--text-dark)" }}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="space-y-3">
        {/* Preview */}
        {previewUrl &&
          (isPDF ? (
            <div
              className="flex items-center gap-3 rounded-2xl p-4"
              style={{
                background: "var(--bg-soft)",
                border: "1px solid var(--primary-light)",
              }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "var(--primary-light)" }}
              >
                <FileText size={18} style={{ color: "var(--primary)" }} />
              </div>
              <div className="flex-1">
                <p
                  className="text-xs font-semibold"
                  style={{ color: "var(--text-dark)" }}
                >
                  PDF Document
                </p>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium transition-opacity hover:opacity-70"
                  style={{ color: "var(--primary)" }}
                >
                  View Document
                </a>
              </div>
              <CheckCircle2 size={16} style={{ color: "#059669" }} />
            </div>
          ) : (
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-w-xs rounded-2xl object-cover"
                style={{ border: "1px solid var(--primary-light)" }}
              />
              {type === "profile_photo" && (
                <span
                  className="absolute top-2 right-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                  style={{ background: "#059669" }}
                >
                  <CheckCircle2 size={10} /> Uploaded
                </span>
              )}
            </div>
          ))}

        {/* Upload button */}
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
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: uploading
                ? "#9ca3af"
                : "linear-gradient(135deg, var(--primary), var(--accent))",
              cursor: uploading ? "not-allowed" : "pointer",
            }}
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <Upload size={14} />{" "}
                {previewUrl ? "Change File" : "Upload File"}
              </>
            )}
          </label>
          <p className="mt-1.5 text-xs text-gray-400">
            Max 5 MB.{" "}
            {accept === "image/*"
              ? "Images only (JPG, PNG, GIF)"
              : "Images or PDF"}
          </p>
        </div>
      </div>
    </div>
  );
}
