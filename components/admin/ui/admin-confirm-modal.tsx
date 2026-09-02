"use client";

import { AdminModal } from "./admin-modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface AdminConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  error?: string | null;
}

export function AdminConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to proceed? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  error = null,
}: AdminConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const footer = (
    <div className="flex items-center justify-end gap-2.5">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
      >
        {cancelText}
      </Button>
      <Button
        type="button"
        variant={variant === "danger" ? "destructive" : "default"}
        onClick={handleConfirm}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            {variant === "danger" && <Trash2 className="w-3.5 h-3.5" />}
            <span>{confirmText}</span>
          </>
        )}
      </Button>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      footer={footer}
      maxWidth="md"
      fixedHeight={false}
    >
      {error && (
        <div className="p-3 mb-3 bg-rose-50 border border-rose-200 rounded-md text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}
      <div className="py-2 flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${variant === "danger"
              ? "bg-rose-50 text-rose-600 border border-rose-200"
              : "bg-amber-50 text-amber-600 border border-amber-200"
            }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs text-slate-700 font-normal leading-relaxed">
          <p>{description}</p>
          <p className="text-[11px] text-slate-600 font-medium pt-1">
            This operation is permanent. Please confirm if you wish to continue.
          </p>
        </div>
      </div>
    </AdminModal>
  );
}
