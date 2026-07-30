import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 [&>svg]:size-3 [&>svg]:pointer-events-none transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground border-border",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        "status-new": "border-status-new/25 bg-status-new/12 text-status-new",
        "status-traction": "border-status-traction/25 bg-status-traction/12 text-status-traction",
        "status-proposed": "border-status-proposed/25 bg-status-proposed/12 text-status-proposed",
        "status-chosen": "border-status-chosen/25 bg-status-chosen/12 text-status-chosen",
        "status-action": "border-status-action/25 bg-status-action/12 text-status-action",
        "status-resolved": "border-status-resolved/25 bg-status-resolved/12 text-status-resolved",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
