'use client';

import { SessionProvider } from "next-auth/react";
import { WelcomeEmailTrigger } from "./WelcomeEmailTrigger";
import { ThemeProvider } from "./ThemeProvider";
import { ActivityTracker } from "./ActivityTracker";
import { ThemeSync } from "./ThemeSync";
import { SessionSync } from "./SessionSync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ThemeSync />
        <SessionSync />
        <WelcomeEmailTrigger />
        <ActivityTracker />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
