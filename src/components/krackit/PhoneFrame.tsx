import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* On mobile we go fullscreen; on larger viewports we show a phone frame */}
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background sm:my-8 sm:min-h-0 sm:h-[850px] sm:rounded-[2.5rem] sm:border sm:border-border sm:shadow-2xl sm:overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}
