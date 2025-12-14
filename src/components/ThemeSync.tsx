'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/components/ThemeProvider';
import { getUserProfile, saveUserProfile } from '@/lib/storage';

export function ThemeSync() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  // 1. When user logs in, load their saved theme
  useEffect(() => {
    const loadUserTheme = async () => {
      if (session?.user?.email) {
        const profile = await getUserProfile(session.user.email);
        if (profile?.theme) {
          console.log(`Loading saved theme for ${session.user.email}: ${profile.theme}`);
          setTheme(profile.theme);
        } else {
          // If no saved theme, default to light (or whatever is current, but user asked for light default)
          // However, if we just logged in and have no preference, we might want to keep the current one 
          // OR enforce light. The user said "first of sll it must ligth theme".
          // So if it's a new user (no profile theme), we set to light.
          setTheme('light');
        }
      } else {
        // No session (logged out). 
        // User requirement: "anyother user have sign in the must not be like a last user"
        // So when logged out, we should revert to default (light).
        setTheme('light');
      }
    };

    loadUserTheme();
  }, [session?.user?.email, setTheme]);

  // 2. When user changes theme, save it to their profile
  useEffect(() => {
    const saveUserTheme = async () => {
      if (session?.user?.email && theme) {
        // We only save if we have a session. 
        // We need to avoid infinite loops or saving the "default" light theme over a user's preference 
        // immediately after login before the load happens.
        // However, the load happens in the effect above.
        // To be safe, we could check if the theme actually changed from what's in storage, 
        // but saveUserProfile merges updates so it's okay.
        
        // Wait a bit to ensure we aren't overwriting during the initial load phase?
        // Actually, the loadUserTheme sets the state. This effect triggers on state change.
        // If loadUserTheme sets 'dark', this effect runs and saves 'dark' (no change).
        // If loadUserTheme sets 'light' (default), this saves 'light'.
        
        await saveUserProfile(session.user.email, { theme });
      }
    };

    // Debounce slightly to avoid rapid saves? Not strictly necessary for localforage but good practice.
    const timeout = setTimeout(saveUserTheme, 500);
    return () => clearTimeout(timeout);
  }, [theme, session?.user?.email]);

  return null; // This component renders nothing
}
