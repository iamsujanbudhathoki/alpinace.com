"use client";

import { FileText, Download, File } from "lucide-react";
import { TripPackageFile } from "@/lib/admin-data";

interface PackageDownloadsProps {
  files: TripPackageFile[];
  title?: string;
}

export function PackageDownloads({ files = [] }: PackageDownloadsProps) {
  if (!files || files.length === 0) return null;

  const getFileIcon = (fileType?: string) => {
    switch (fileType?.toLowerCase()) {
      case "pdf":
        return <FileText className="w-5 h-5 text-rose-700" strokeWidth={1.75} />;
      case "doc":
      case "docx":
        return <FileText className="w-5 h-5 text-blue-700" strokeWidth={1.75} />;
      default:
        return <File className="w-5 h-5 text-emerald-800" strokeWidth={1.75} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="type-heading-xl">
          Downloads
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {files.map((file, idx) => (
          <div
            key={file.id || idx}
            className="p-3 bg-white border border-stone-200 rounded-xl flex items-center justify-between gap-3 hover:border-stone-400 transition-all shadow-2xs group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-stone-100 border border-stone-200 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                {getFileIcon(file.fileType)}
              </div>

              <div className="min-w-0">
                <h3 className="type-heading-md text-stone-900 truncate group-hover:underline transition-colors">
                  {file.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                  {file.fileSize && <span>{file.fileSize}</span>}
                  {file.fileType && (
                    <span className="type-caption text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                      {file.fileType}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <a
              href={file.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="btn-secondary p-2 text-stone-600 hover:text-stone-900 hover:border-stone-400"
              title="Download file"
            >
              <Download className="w-4 h-4" strokeWidth={2} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
