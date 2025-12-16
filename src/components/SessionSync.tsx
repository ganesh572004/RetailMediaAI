'use client';

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { saveUserProfile, getUserProfile } from "@/lib/storage";

export function SessionSync() {
  const { data: session } = useSession();

  useEffect(() => {
    const syncSession = async () => {
      if (session?.user?.email) {
        // Check existing profile first to avoid overwriting custom data
        const currentProfile = await getUserProfile(session.user.email);
        
        const updates: any = {
          email: session.user.email,
        };

        // Only sync name if not present locally
        if (session.user.name && !currentProfile?.name) {
          updates.name = session.user.name;
        }

        // Only sync image if not present locally (preserves custom uploads)
        if (session.user.image && !currentProfile?.image) {
          updates.image = session.user.image;
        }

        // Only save if we have meaningful updates (more than just email)
        // or if the user doesn't exist yet (currentProfile is null)
        if (!currentProfile || Object.keys(updates).length > 1) {
           await saveUserProfile(session.user.email, updates);
        }
      }
    };

    syncSession();
  }, [session]);

  return null;
}
