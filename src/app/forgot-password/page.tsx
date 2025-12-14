'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { ShoppingBag, ArrowLeft, Mail, Tag, BarChart, Image as ImageIcon, Megaphone, Sparkles } from 'lucide-react';

const BackgroundIcons = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-20 left-20 animate-bounce duration-3000">
      <Tag className="h-12 w-12 text-blue-200 opacity-50 rotate-12" />
    </div>
    <div className="absolute top-40 right-20 animate-pulse duration-4000">
      <BarChart className="h-16 w-16 text-purple-200 opacity-50 -rotate-12" />
    </div>
    <div className="absolute bottom-20 left-1/4 animate-bounce duration-5000">
      <ImageIcon className="h-14 w-14 text-pink-200 opacity-50 rotate-45" />
    </div>
    <div className="absolute bottom-40 right-1/3 animate-pulse duration-3500">
      <Megaphone className="h-10 w-10 text-yellow-200 opacity-50 -rotate-6" />
    </div>
    <div className="absolute top-1/3 left-10 animate-spin duration-10000">
      <Sparkles className="h-8 w-8 text-green-200 opacity-50" />
    </div>
  </div>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        alert('Failed to send reset link. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-500">
      <BackgroundIcons />
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center animate-bounce">
          <div className="relative">
            <ShoppingBag className="h-12 w-12 text-primary" />
            <div className="absolute -top-2 -right-2 text-2xl">🤔</div>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Don't worry, it happens to the best of us.
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="overflow-hidden transition-all duration-500 hover:shadow-lg border-t-4 border-primary bg-card-background">
          <CardContent className="py-8 px-4 sm:px-10">
            {!isSubmitted ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <span className="text-4xl">🤯</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <Input
                      label="Email address"
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-10"
                    />
                  </div>

                  <Button className="w-full group relative overflow-hidden" size="lg" type="submit" disabled={isLoading}>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                      {!isLoading && <Mail className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                    </span>
                    <div className="absolute inset-0 bg-primary/90 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                  </Button>
                </form>
              </div>
            ) : (
              <div className="text-center animate-in zoom-in duration-500">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/10 mb-4">
                  <Mail className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Check your email</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Didn't receive the email? <button onClick={() => setIsSubmitted(false)} className="text-primary hover:text-primary/80 font-medium">Click to try again</button>
                </p>
              </div>
            )}

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card-background text-muted-foreground">Remember your password?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/login">
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2 group">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
