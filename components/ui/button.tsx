import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:bg-primary-hover hover:shadow-glow",
        gradient:
          "bg-brand-pill text-white shadow-soft hover:shadow-glow hover:brightness-110",
        teal: "bg-brand-teal-dark text-white shadow-soft hover:bg-brand-teal",
        secondary: "bg-accent text-accent-foreground hover:bg-[#e2e8fd]",
        outline:
          "border border-border bg-surface text-foreground hover:border-primary/40 hover:bg-accent",
        onDark:
          "border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20",
        onBrand: "bg-white text-brand-teal-dark shadow-soft hover:bg-white/90",
        ghost: "hover:bg-accent text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-[#c93a3f]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-7 text-[0.95rem]",
        xl: "h-14 px-9 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
