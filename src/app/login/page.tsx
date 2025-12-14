'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { ShoppingBag } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getEmailByPhone, validateUserCredentials, checkUserExists } from '@/lib/storage';

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg fill="#1877F2" viewBox="0 0 24 24" className={className}>
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.048 0-2.733.984-2.733 2.582v1.39h4.508l-1.06 3.667h-3.448v7.98h-5.08z"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const TAGLINES = [
  { text: "Design pro? Now you are.", color: "text-blue-600", bg: "bg-blue-100" },
  { text: "Ad compliance, minus the headache.", color: "text-purple-600", bg: "bg-purple-100" },
  { text: "Instant ads. Just add coffee.", color: "text-amber-600", bg: "bg-amber-100" },
  { text: "Your brand police will love us.", color: "text-emerald-600", bg: "bg-emerald-100" },
  { text: "Pixel perfect. Zero effort required.", color: "text-rose-600", bg: "bg-rose-100" },
  { text: "Designing made dangerously easy.", color: "text-indigo-600", bg: "bg-indigo-100" }
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Animation State
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Start fade out
      setTimeout(() => {
        setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
        setFade(true); // Start fade in
      }, 500); // Wait for fade out to complete (0.5s)
    }, 3000); // Total cycle time

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let signInEmail = email;
      
      // Check if input looks like a phone number (basic check)
      const isPhone = /^[+]?[0-9\-\s()]+$/.test(email) && !email.includes('@');
      
      if (isPhone) {
        // Try to find the email associated with this phone number
        const linkedEmail = await getEmailByPhone(email);
        if (linkedEmail) {
          signInEmail = linkedEmail;
        } else {
          alert("Incorrect phone number or password.");
          setIsLoading(false);
          return;
        }
      }

      // Client-side validation before calling NextAuth
      // 1. Check if user exists
      const userExists = await checkUserExists(signInEmail);
      if (!userExists) {
        alert("There is no account with these details. Please create an account.");
        setIsLoading(false);
        return;
      }

      // 2. Validate credentials
      const validation = await validateUserCredentials(signInEmail, password);
      if (!validation.isValid) {
        // Show specific error if user exists but has no password (e.g. Google user)
        if (validation.error && validation.error.includes('Google')) {
            alert(validation.error);
        } else {
            alert("Incorrect phone number or password.");
        }
        setIsLoading(false);
        return;
      }

      // If validation passes, proceed to NextAuth sign in
      const result = await signIn('credentials', {
        email: signInEmail,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/dashboard');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert("An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ShoppingBag className="h-12 w-12 text-primary" />
        </div>
                  <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
            Sign in to your account
          </h2>
          <div className="mt-4 h-16 flex items-center justify-center overflow-hidden">
            <div 
              className={`relative px-6 py-2 rounded-full transition-all duration-500 ease-in-out transform ${TAGLINES[taglineIndex].bg}`}
              style={{ 
                opacity: fade ? 1 : 0,
                transform: fade ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)'
              }}
            >
              <span className={`text-xl md:text-2xl font-bold ${TAGLINES[taglineIndex].color}`}>
                {TAGLINES[taglineIndex].text}
              </span>
            </div>
          </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="py-8 px-4 sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Email address or Phone Number"
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium text-primary hover:text-primary/80">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>

              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link href="/register" className="font-medium text-primary hover:text-primary/80">
                    Create Account
                  </Link>
                </p>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card-background text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2" 
                    onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                  >
                    <GoogleIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Google</span>
                  </Button>
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2" 
                    onClick={() => signIn('facebook', { callbackUrl: '/dashboard' })}
                  >
                    <FacebookIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Facebook</span>
                  </Button>
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2" 
                    onClick={() => signIn('twitter', { callbackUrl: '/dashboard' })}
                  >
                    <TwitterIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Twitter</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
