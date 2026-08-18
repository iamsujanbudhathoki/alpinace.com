"use client";

import { FileText, Download, FileCode, File, ExternalLink } from "lucide-react";
import { TripPackageFile } from "@/lib/admin-data";

interface PackageDownloadsProps {
  files: TripPackageFile[];
  title?: string;
}

export function PackageDownloads({ files = [], title }: PackageDownloadsProps) {
  if (!files || files.length === 0) return null;

  const getFileIcon = (fileType?: string) => {
    switch (fileType?.toLowerCase()) {
      case "pdf":
        return <FileText className="w-5 h-5 text-rose-600" />;
      case "doc":
      case "docx":
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <File className="w-5 h-5 text-emerald-700" />;
    }
  };

  return (
    <div className="bg-white border border-[#EAE5DC] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6E0D5]">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1E2420] flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-700" />
            <span>Downloadable Package Files &amp; Brochures</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#6B726C] mt-1">
            Download official brochures, route profiles, equipment checklists, and trip documentation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {files.map((file, idx) => (
          <div
            key={file.id || idx}
            className="p-4 bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl flex items-center justify-between gap-4 hover:border-amber-400/60 hover:bg-white transition-all shadow-2xs group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="p-3 bg-white border border-[#EAE5DC] rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                {getFileIcon(file.fileType)}
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#1E2420] truncate group-hover:text-amber-800 transition-colors">
                  {file.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-[#6B726C] mt-0.5">
                  {file.fileSize && <span>{file.fileSize}</span>}
                  {file.fileType && (
                    <span className="uppercase font-semibold text-[10px] text-[#2D4536] bg-[#EAE5DC] px-1.5 py-0.2 rounded">
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#2D4536] hover:bg-[#1E2E24] text-white text-xs font-bold rounded-xl shrink-0 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
