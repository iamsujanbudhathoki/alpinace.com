"use client";

import React from "react";
import { AppProgressProvider as ProgressProvider } from "@bprogress/next";

export function TopLoaderProvider({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider
      height="3px"
      color="#d97706"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
}
