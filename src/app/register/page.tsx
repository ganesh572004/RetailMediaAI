'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { ShoppingBag, UserPlus, Sparkles, Rocket, Star } from 'lucide-react';
import { registerUser, checkUserExists } from '@/lib/storage';
import { ROLES } from '@/components/ProfileForm';

const BackgroundIcons = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Gradient Background */}
    <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-purple-500/5" />
    
    {/* Animated Emojis & Icons */}
    <div className="absolute top-20 left-20 animate-bounce duration-3000">
      <Sparkles className="h-12 w-12 text-primary/20 rotate-12" />
    </div>
    <div className="absolute top-40 right-20 animate-pulse duration-4000">
      <Rocket className="h-16 w-16 text-purple-500/20 -rotate-12" />
    </div>
    <div className="absolute bottom-20 left-1/4 animate-bounce duration-5000">
      <Star className="h-14 w-14 text-yellow-500/20 rotate-45" />
    </div>
    
    {/* Extra Floating Elements */}
    <div className="absolute top-1/3 left-10 animate-spin duration-10000">
      <div className="text-4xl opacity-20">🎨</div>
    </div>
    <div className="absolute bottom-1/3 right-10 animate-bounce duration-6000">
      <div className="text-4xl opacity-20">🚀</div>
    </div>
    <div className="absolute top-10 right-1/3 animate-pulse duration-5000">
      <div className="text-4xl opacity-20">💡</div>
    </div>
    <div className="absolute bottom-10 left-1/3 animate-bounce duration-7000">
      <div className="text-4xl opacity-20">✨</div>
    </div>
    
    {/* Floating Circles */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl animate-pulse duration-8000" />
  </div>
);

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: ROLES[0],
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [verificationStep, setVerificationStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (error) setError('');
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
    if (error) setError('');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password was not match');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Check if user already exists (Client-side check)
      const exists = await checkUserExists(formData.email);
      if (exists) {
        setError('This mail was already resigter and have a account');
        setIsLoading(false);
        return;
      }

      // 2. Send OTP to verify email existence
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages from API
        if (data.error && data.error.includes('does not exist')) {
           setError('The enter mail was not there');
        } else {
           setError(data.error || 'Failed to send verification code');
        }
        setIsLoading(false);
        return;
      }

      // OTP sent successfully
      setServerOtp(data.otp); // In production, use hash
      setVerificationStep('otp');
      
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Verify OTP
      if (otp !== serverOtp) {
        setError('Invalid verification code');
        setIsLoading(false);
        return;
      }

      // Register User
      await registerUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      });

      // Send welcome email
      try {
        await fetch('/api/send-welcome-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            name: `${formData.firstName} ${formData.lastName}`,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      // Success! Redirect to login
      alert('Account created successfully! Please sign in.');
      router.push('/login');
    } catch (err: any) {
      if (err.message === 'User already exists') {
        setError('This mail was already resigter and have a account');
      } else {
        setError('Failed to create account. Please try again.');
      }
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
            <div className="absolute -top-2 -right-2 text-2xl">✨</div>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          {verificationStep === 'form' ? 'Create your account' : 'Verify Email'}
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {verificationStep === 'form' ? 'Join RetailMediaAI and start creating.' : `We sent a code to ${formData.email}`}
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="overflow-hidden transition-all duration-500 hover:shadow-lg border-t-4 border-primary bg-card-background">
          <CardContent className="py-8 px-4 sm:px-10">
            {verificationStep === 'form' ? (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <Input
                  label="Last Name"
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="role" className="block text-sm font-medium text-foreground">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Email address"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
              />

              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
              />

              <div>
                <Input
                  label="Retype Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {error === 'Password was not match' && (
                  <p className="mt-1 text-sm text-red-500 animate-pulse">
                    Password was not match
                  </p>
                )}
              </div>

              {error && error !== 'Password was not match' && (
                <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded border border-red-200">
                  {error}
                </div>
              )}

              <Button className="w-full group relative overflow-hidden" size="lg" type="submit" disabled={isLoading}>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? 'Verifying...' : 'Create Account'}
                  {!isLoading && <UserPlus className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                </span>
                <div className="absolute inset-0 bg-primary/90 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </Button>
            </form>
            ) : (
              <form className="space-y-6" onSubmit={handleVerifyAndRegister}>
                <div className="space-y-2">
                  <Input
                    label="Verification Code"
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={handleOtpChange}
                    className="text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-center text-muted-foreground">
                    Check your email (and spam folder) for the code.
                  </p>
                </div>

                {error && (
                  <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded border border-red-200">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Verify & Register'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setVerificationStep('form')}
                    disabled={isLoading}
                  >
                    Back to details
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card-background text-muted-foreground">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Sign in instead
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
