'use client';

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { saveUserProfile } from "@/lib/storage";

export function SessionSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.email) {
      // Sync session user to local storage so they are recognized as "existing users"
      saveUserProfile(session.user.email, {
        name: session.user.name || undefined,
        email: session.user.email,
        image: session.user.image || undefined,
      });
    }
  }, [session]);

  return null;
}
