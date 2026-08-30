import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent text-xs font-semibold whitespace-nowrap transition-colors outline-none select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-900/20 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-rose-500 aria-invalid:ring-2 aria-invalid:ring-rose-500/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-slate-800 shadow-xs",
        outline:
          "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-900 shadow-xs",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200/80 border-slate-200",
        ghost:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700 shadow-xs focus-visible:ring-rose-500/30",
        link: "text-slate-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 gap-2 text-xs font-semibold rounded-md",
        sm: "h-8 px-3 py-1.5 gap-1.5 text-xs font-semibold rounded-md",
        lg: "h-10 px-5 py-2.5 gap-2 text-sm font-semibold rounded-md",
        xs: "h-7 px-2.5 py-1 gap-1 text-[11px] font-medium rounded-md",
        icon: "size-9 rounded-md",
        "icon-xs": "size-7 rounded-md",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
