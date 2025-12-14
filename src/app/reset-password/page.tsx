'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { ShoppingBag, CheckCircle, Lock } from 'lucide-react';
import { updateUserPassword } from '@/lib/storage';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    if (!email) {
      alert("Invalid reset link.");
      return;
    }

    setIsLoading(true);

    try {
      await updateUserPassword(email, password);
      setIsLoading(false);
      setIsSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error(error);
      alert("Failed to reset password.");
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center animate-in zoom-in duration-500">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-500/10 mb-6 animate-bounce">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Password Reset! 🎉</h3>
        <p className="text-muted-foreground mb-6">
          Your password has been successfully updated. You can now log in with your new password.
        </p>
        <p className="text-sm text-primary">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <p className="text-muted-foreground text-sm">
          Create a new password for <span className="font-medium text-foreground">{email || 'your account'}</span>.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          label="New Password"
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <Input
          label="Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
        />

        <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ShoppingBag className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          Reset Password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="py-8 px-4 sm:px-10">
            <Suspense fallback={<div className="text-center p-4 text-muted-foreground">Loading...</div>}>
              <ResetPasswordContent />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
