"use client";

import { useState } from "react";
import {
  FileText,
  UploadCloud,
  Plus,
  Trash2,
  Download,
  FileCode,
  File,
  Loader2,
  ExternalLink,
  Edit2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MediaService } from "@/lib/services/admin-service";
import { TripPackageFile } from "@/lib/admin-data";

interface TripFilesManagerProps {
  files: TripPackageFile[];
  onChange: (files: TripPackageFile[]) => void;
  readOnly?: boolean;
}

export function TripFilesManager({
  files = [],
  onChange,
  readOnly = false,
}: TripFilesManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    setIsUploading(true);

    const newPackageFiles: TripPackageFile[] = [];
    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const res = await MediaService.uploadFile(file);

        const mediaId = res?.data?.id;
        const url = res?.data?.url || (res as any)?.url;
        const name = res?.data?.originalName || res?.data?.filename || res?.data?.title || file.name;
        const sizeBytes = res?.data?.fileSize || res?.data?.size || file.size;
        const sizeFormatted = sizeBytes
          ? `${(Number(sizeBytes) / (1024 * 1024)).toFixed(1)} MB`
          : "PDF Document";

        if (url || mediaId) {
          const ext = name.split(".").pop()?.toLowerCase() || "pdf";
          newPackageFiles.push({
            id: `file-${Date.now()}-${i}`,
            mediaId,
            title: name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
            fileUrl: url,
            fileName: name,
            fileSize: sizeFormatted,
            fileType: ext,
            uploadedAt: new Date().toISOString().split("T")[0],
          });
        }
      }

      if (newPackageFiles.length > 0) {
        onChange([...files, ...newPackageFiles]);
        toast.success(`${newPackageFiles.length} file(s) uploaded successfully`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload package document");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleStartEditTitle = (index: number) => {
    setEditingIndex(index);
    setEditTitle(files[index].title);
  };

  const handleSaveTitle = (index: number) => {
    if (!editTitle.trim()) return;
    const next = [...files];
    next[index] = { ...next[index], title: editTitle.trim() };
    onChange(next);
    setEditingIndex(null);
    toast.success("Document title updated");
  };

  const handleRemoveFile = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    onChange(next);
    toast.info("Document removed from package");
  };

  const getFileIcon = (fileType?: string) => {
    switch (fileType?.toLowerCase()) {
      case "pdf":
        return <FileText className="w-5 h-5 text-rose-600" />;
      case "doc":
      case "docx":
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <File className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Downloadable Package Files &amp; Brochures ({files.length})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload PDF brochures, packing lists, or detail guides available for Marketing Associates and clients to download.
          </p>
        </div>

        {!readOnly && (
          <label className="cursor-pointer shrink-0">
            <span className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors">
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UploadCloud className="w-3.5 h-3.5" />
              )}
              <span>Upload Document (PDF/Doc)</span>
            </span>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Files List */}
      {files.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/70 border border-dashed border-slate-200 rounded-xl">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">No Downloadable Files Uploaded</p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
            Upload package brochures or PDFs. Marketing Associates will be able to download them directly from the package details page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {files.map((file, idx) => (
            <div
              key={file.id || idx}
              className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-xs hover:border-emerald-200 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2.5 bg-slate-100 rounded-lg shrink-0">
                  {getFileIcon(file.fileType)}
                </div>

                <div className="min-w-0 flex-1">
                  {editingIndex === idx ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="h-7 text-xs px-2 rounded border border-emerald-400 focus:outline-none w-full"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveTitle(idx)}
                        className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {file.title}
                      </h4>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleStartEditTitle(idx)}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                          title="Rename title"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    {file.fileSize && <span>{file.fileSize}</span>}
                    {file.fileType && (
                      <span className="uppercase font-semibold text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {file.fileType}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors text-xs flex items-center gap-1"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors text-xs"
                    title="Delete File"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
