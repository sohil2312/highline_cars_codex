import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 brutal-border bg-accent text-black hover:bg-black hover:text-white",
  {
    variants: {
      variant: {
        default: "",
        destructive: "bg-major text-white hover:bg-black hover:text-white",
        outline: "bg-white",
        secondary: "bg-accentSoft text-black hover:bg-black hover:text-white",
        ghost: "border-transparent hover:border-black",
        link: "border-transparent underline underline-offset-4 hover:bg-transparent"
      },
      size: {
        default: "h-11 px-5 py-3 text-base",
        sm: "h-11 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-11 w-11"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
