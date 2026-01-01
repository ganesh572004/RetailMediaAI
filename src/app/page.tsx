'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, Zap, ShieldCheck, Layout } from 'lucide-react';
import { VideoModal } from '@/components/VideoModal';

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <VideoModal 
        isOpen={showDemo} 
        onClose={() => setShowDemo(false)} 
        videoSrc="/live%20demo.mp4" 
      />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-background sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 transition-colors duration-500">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-foreground sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Create professional</span>{' '}
                  <span className="block text-primary xl:inline">retail ads in seconds</span>
                </h1>
                <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Ganesh's RetailMediaAI automates the creation of brand-compliant creatives. Upload your product, and let our AI generate stunning ads for every channel.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link 
                      href="/login" 
                      className="w-full flex items-center justify-center px-8 py-3 text-base font-medium md:py-4 md:text-lg md:px-10 bg-primary text-primary-foreground hover:opacity-90 focus:ring-primary rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                    >
                      Get Started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="w-full flex items-center justify-center px-8 py-3 text-base font-medium md:py-4 md:text-lg md:px-10"
                      onClick={() => setShowDemo(true)}
                    >
                      Live Demo
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-muted/30 flex items-center justify-center transition-colors duration-500 min-h-[300px] lg:min-h-0">
          <div className="p-8 w-full max-w-md">
             {/* Placeholder for Hero Image */}
             <div className="bg-card-background p-6 rounded-xl shadow-xl w-full transform rotate-3 hover:rotate-0 transition-all duration-500 border border-border">
                <div className="h-64 bg-primary/10 rounded-lg mb-4 flex items-center justify-center">
                    <ShoppingBag className="h-24 w-24 text-primary" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-muted/30 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-foreground sm:text-4xl">
              Everything you need to scale
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-foreground">AI-Powered Design</h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Automatically generate layouts and images tailored to your brand and product.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-foreground">Compliance Engine</h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Built-in checks ensure every creative meets retailer and brand guidelines.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                  <Layout className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-foreground">Multi-Format Export</h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Download ads in all major formats (JPG, PNG, HTML5) instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
