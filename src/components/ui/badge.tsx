import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-none border-2 border-black px-2 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        ok: "status-ok",
        minor: "status-minor",
        major: "status-major",
        na: "status-na",
        outline: "bg-white text-black"
      }
    },
    defaultVariants: {
      variant: "outline"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
