```tsx
import * as React from "react";
import { cn } from "../utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[80px] w-full rounded-lg border p-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";
```
