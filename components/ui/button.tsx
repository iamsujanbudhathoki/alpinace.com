import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent text-xs font-semibold whitespace-nowrap transition-colors outline-none select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-900/20 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-rose-500 aria-invalid:ring-2 aria-invalid:ring-rose-500/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-slate-800 shadow-2xs active:scale-[0.98]",
        outline:
          "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-900 shadow-2xs active:scale-[0.98]",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200/80 border border-slate-200/60 active:scale-[0.98]",
        ghost:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700 shadow-2xs focus-visible:ring-rose-500/30 active:scale-[0.98]",
        link: "text-slate-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 gap-2 text-xs font-semibold rounded-xl",
        sm: "h-8 px-3 py-1.5 gap-1.5 text-xs font-semibold rounded-xl",
        lg: "h-10 px-5 py-2.5 gap-2 text-sm font-semibold rounded-xl",
        xs: "h-7 px-2.5 py-1 gap-1 text-[11px] font-medium rounded-xl",
        icon: "size-9 rounded-xl",
        "icon-xs": "size-7 rounded-xl",
        "icon-sm": "size-8 rounded-xl",
        "icon-lg": "size-10 rounded-xl",
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
