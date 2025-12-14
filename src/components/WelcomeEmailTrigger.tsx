'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { hasWelcomeEmailBeenSent, setWelcomeEmailSent } from '@/lib/storage';

export const WelcomeEmailTrigger = () => {
  const { data: session } = useSession();

  useEffect(() => {
    const checkAndSendEmail = async () => {
      if (session?.user?.email) {
        const email = session.user.email;
        const name = session.user.name || email.split('@')[0];
        
        const alreadySent = await hasWelcomeEmailBeenSent(email);
        
        if (!alreadySent) {
          try {
            const response = await fetch('/api/send-welcome-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, name }),
            });

            if (response.ok) {
              await setWelcomeEmailSent(email);
              console.log('Welcome email sent successfully');
            }
          } catch (error) {
            console.error('Failed to send welcome email:', error);
          }
        }
      }
    };

    checkAndSendEmail();
  }, [session]);

  return null;
};
