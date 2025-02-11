"use client"

import { ThemeProvider } from "next-themes";

interface ProvidersProps {
  children: React.ReactNode;
  className?: string; // Make className optional
}

export function Providers({ children, className }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class">
      <div className={className}> {/* Apply className to a wrapper div */}
        {children}
      </div>
    </ThemeProvider>
  );
}
