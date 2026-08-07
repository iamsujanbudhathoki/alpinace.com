"use client";

import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, Loader2, Link as LinkIcon } from "lucide-react";
import { MediaService } from "@/lib/services/admin-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUploader({ value = "", onChange, label = "Cover / Banner Image" }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<"file" | "url">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await MediaService.uploadFile(file);
      const url = res?.data?.url;
      if (url) {
        onChange(url);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await MediaService.uploadFile(file);
      const url = res?.data?.url;
      if (url) {
        onChange(url);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <label className="block text-slate-700 font-bold">{label}</label>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`px-2 py-0.5 rounded-md transition-colors ${mode === "file" ? "bg-white text-slate-900 shadow-xs font-bold" : "hover:text-slate-900"}`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2 py-0.5 rounded-md transition-colors ${mode === "url" ? "bg-white text-slate-900 shadow-xs font-bold" : "hover:text-slate-900"}`}
          >
            Image URL
          </button>
        </div>
      </div>

      {value ? (
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
          <img
            src={value}
            alt="Uploaded preview"
            className="w-full h-36 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80";
            }}
          />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onChange("")}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-8 px-3 cursor-pointer shadow-md"
            >
              <X className="w-3.5 h-3.5 mr-1" /> Remove Image
            </Button>
          </div>
        </div>
      ) : mode === "file" ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 bg-slate-50/50"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {isUploading ? (
            <div className="py-3 flex flex-col items-center gap-2 text-slate-600">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              <span className="text-xs font-bold">Uploading file to local server...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                <UploadCloud className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Click to upload or drag &amp; drop</span>
                <span className="text-[11px] text-slate-500">PNG, JPG, WEBP up to 10MB</span>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <LinkIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <Input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="text-xs bg-slate-50 border-slate-200 pl-9 focus:bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
