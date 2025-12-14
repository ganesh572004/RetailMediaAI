'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Settings, LogOut } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getUserProfile } from '@/lib/storage';

export const Navbar = () => {
  const { data: session } = useSession();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileImage = async () => {
      if (session?.user?.email) {
        try {
          const profile = await getUserProfile(session.user.email);
          if (profile?.image) {
            setProfileImage(profile.image);
          } else if (session.user.image) {
            setProfileImage(session.user.image);
          }
        } catch (error) {
          console.error('Error loading profile image for navbar:', error);
        }
      }
    };
    
    loadProfileImage();
    
    // Listen for storage events to update image across tabs/components
    const handleStorageChange = () => {
        loadProfileImage();
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-tab updates
    window.addEventListener('profile-updated', handleStorageChange);
    
    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('profile-updated', handleStorageChange);
    };
  }, [session]);

  return (
    <nav className="bg-card-background border-b border-border sticky top-0 z-50 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="shrink-0 flex items-center">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-foreground">RetailMediaAI</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/dashboard" className="border-transparent text-muted-foreground hover:border-border hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/results" className="border-transparent text-muted-foreground hover:border-border hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                My Creatives
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <Link href="/profile" className="p-0.5 rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors overflow-hidden border border-transparent hover:border-primary">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="p-1">
                    <User className="h-6 w-6" />
                </div>
              )}
            </Link>
            <Link href="/settings" className="p-1 rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
              <Settings className="h-6 w-6" />
            </Link>
            <Link href="/login" className="p-1 rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
              <LogOut className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
