"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  /** Sticky footer rendered outside the scrollable area (e.g. action buttons). */
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  /** Max height of the scrollable body. Defaults to 75vh. Pass "none" to disable. */
  maxHeight?: string;
  preventOutsideClose?: boolean;
  hideHeader?: boolean;
  variant?: "default" | "dark";
  contentClassName?: string;
}

export function AdminModal({
  isOpen,
  onClose,
  title = "",
  description,
  children,
  footer,
  maxWidth = "xl",
  maxHeight = "75vh",
  preventOutsideClose = true,
  hideHeader = false,
  variant = "default",
  contentClassName = "",
}: AdminModalProps) {
  const maxWidthClass = {
    sm: "sm:max-w-md",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-3xl",
    "2xl": "sm:max-w-5xl",
    full: "sm:max-w-[92vw]",
  }[maxWidth];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenChange = (open: boolean, eventDetails?: any) => {
    if (!open) {
      if (preventOutsideClose) {
        const reason = eventDetails?.reason;
        const target =
          eventDetails?.target ||
          eventDetails?.event?.target ||
          eventDetails?.nativeEvent?.target;

        const isBackdropClick =
          reason === "backdrop-click" ||
          reason === "outside-click" ||
          reason === "backdropClick" ||
          reason === "outsidePress" ||
          reason === "backdrop" ||
          reason === "outside" ||
          (target &&
            typeof target.getAttribute === "function" &&
            target.getAttribute("data-slot") === "dialog-overlay");

        if (isBackdropClick) return;
      }
      onClose();
    }
  };

  const isDark = variant === "dark";
  const hasHeader = !hideHeader && (title || description);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={true}
        onCloseClick={onClose}
        className={`${maxWidthClass} w-full flex flex-col overflow-hidden ${
          isDark
            ? "bg-slate-950 text-white border-slate-800 shadow-2xl rounded-2xl p-0"
            : "bg-white text-slate-900 border-slate-200 shadow-xl rounded-2xl p-0"
        } ${contentClassName}`}
      >
        {/* ── Sticky Header ─────────────────────────────── */}
        {hasHeader && (
          <div
            className={`flex-none px-6 pt-5 pb-3 border-b ${
              isDark ? "border-slate-800" : "border-slate-100"
            }`}
          >
            <DialogHeader className="space-y-0.5 text-left pr-8">
              {title && (
                <DialogTitle className="font-heading text-lg font-extrabold text-slate-950 leading-tight">
                  {title}
                </DialogTitle>
              )}
              {description && (
                <DialogDescription className="text-xs text-slate-800 font-semibold leading-normal">
                  {description}
                </DialogDescription>
              )}
            </DialogHeader>
          </div>
        )}

        {/* ── Scrollable Body ────────────────────────────── */}
        <div
          className="modal-scroll flex-1 min-h-0 overflow-y-auto overscroll-contain"
          style={{ maxHeight: maxHeight !== "none" ? maxHeight : undefined }}
        >
          <div className={isDark ? "p-3" : "px-6 py-4"}>{children}</div>
        </div>

        {/* ── Sticky Footer ──────────────────────────────── */}
        {footer && (
          <div
            className={`flex-none border-t ${
              isDark ? "border-slate-800 px-3 py-3" : "border-slate-100 px-6 py-4"
            } bg-white/80 backdrop-blur-sm`}
          >
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
