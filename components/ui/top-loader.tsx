"use client";

import React from "react";
import { AppProgressProvider as ProgressProvider } from "@bprogress/next";

export function TopLoaderProvider({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider
      height="3px"
      color="#0f172a"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
}
