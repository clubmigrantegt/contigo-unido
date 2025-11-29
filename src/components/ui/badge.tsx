import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-white shadow-sm",
        secondary:
          "bg-slate-100 text-slate-900 border border-slate-200",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm",
        success:
          "bg-success text-success-foreground shadow-sm",
        outline: "border border-slate-200 text-slate-700 bg-white",
        featured: "bg-emerald-500/95 text-white backdrop-blur-sm shadow-sm",
        rating: "bg-white/95 text-slate-900 backdrop-blur-sm shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
