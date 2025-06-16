import "../styles/globals.css"; // Tailwind base
import { ReactNode } from "react";

export const metadata = { title: "AI Bibliography Demo" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
