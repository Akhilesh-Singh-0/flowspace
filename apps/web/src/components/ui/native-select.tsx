import * as React from "react"

import { cn } from "@/lib/utils"

const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<"select">
>(({ className, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "native-select h-8 w-full rounded-md border border-input bg-surface px-3 text-medium text-foreground outline-none transition-colors [color-scheme:dark] focus:border-ring focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
})
NativeSelect.displayName = "NativeSelect"

export { NativeSelect }
