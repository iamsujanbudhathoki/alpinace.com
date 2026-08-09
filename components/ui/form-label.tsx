import React from "react";
import { cn } from "@/lib/utils";

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

export function FormLabel({ required, children, className, ...props }: FormLabelProps) {
  return (
    <label
      className={cn("text-xs font-semibold text-zinc-800 block mb-1 select-none", className)}
      {...props}
    >
      {children}
      {required && <span className="text-rose-500 ml-0.5 font-bold">*</span>}
    </label>
  );
}
