import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 transition-colors outline-none placeholder:text-slate-500 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
