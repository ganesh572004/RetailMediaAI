'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { saveUserProfile, getUserProfile } from '@/lib/storage';

interface ProfileFormProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export const ROLES = [
  "Student",
  "Unemployed",
  "Marketing Manager",
  "Software Engineer",
  "Graphic Designer",
  "Product Manager",
  "Data Scientist",
  "Sales Representative",
  "Teacher / Educator",
  "Healthcare Professional",
  "Lawyer / Legal Professional",
  "Accountant / Financial Advisor",
  "Consultant",
  "Freelancer",
  "Business Owner / Founder",
  "Retail Associate",
  "Administrative Assistant",
  "Other"
];

export const ProfileForm: React.FC<ProfileFormProps> = ({ user }) => {
  const nameParts = user.name?.split(' ') || ['User', ''];
  const [firstName, setFirstName] = useState(nameParts[0]);
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' '));
  const [email, setEmail] = useState(user.email || '');
  const [role, setRole] = useState("Student");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (user?.email) {
        const savedProfile = await getUserProfile(user.email);
        if (savedProfile) {
            if (savedProfile.name) {
                const parts = savedProfile.name.split(' ');
                setFirstName(parts[0]);
                setLastName(parts.slice(1).join(' '));
            }
            if (savedProfile.role) setRole(savedProfile.role);
        }
        // Always ensure email matches session if present
        setEmail(user.email);
      }
    };
    loadProfile();
  }, [user.email]);

  const handleSave = async () => {
    setIsSaving(true);
    const fullName = `${firstName} ${lastName}`.trim();
    
    if (user?.email) {
        await saveUserProfile(user.email, {
            name: fullName,
            role,
            email: user.email
        });
    }

    setTimeout(() => {
      setIsSaving(false);
      alert(`Profile updated!\nName: ${fullName}\nRole: ${role}`);
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-500"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-500"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
        
        <Input 
            label="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            type="email" 
            readOnly={!!user.email} 
            disabled={!!user.email} 
            className={user.email ? "bg-muted opacity-70" : ""} 
        />
        
        <div className="w-full">
          <label className="block text-sm font-medium text-foreground mb-1">Role</label>
          <select
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLES.map((r) => (
              <option key={r} value={r} className="bg-background text-foreground">
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
