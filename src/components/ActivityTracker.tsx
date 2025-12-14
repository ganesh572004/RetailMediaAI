'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { updateUsageTime } from '@/lib/storage';

export const ActivityTracker = () => {
  const { data: session } = useSession();
  const email = session?.user?.email;

  useEffect(() => {
    if (!email) return;

    // Update usage every minute
    const interval = setInterval(() => {
      // Only count if window is focused (optional, but better for "real" usage)
      if (document.hasFocus()) {
        updateUsageTime(email);
      }
    }, 60000); // 60000ms = 1 minute

    return () => clearInterval(interval);
  }, [email]);

  return null; // This component doesn't render anything
};
