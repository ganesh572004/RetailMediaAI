'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { CreativesList } from '@/components/CreativesList';
import { ImageGenerator } from '@/components/ImageGenerator';

export default function ResultsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleImageSaved = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-foreground mb-6">My Creatives</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Image Generator (1/3 width) */}
            <div className="lg:col-span-1">
              <ImageGenerator onImageSaved={handleImageSaved} />
            </div>

            {/* Right Column: Creatives List (2/3 width) */}
            <div className="lg:col-span-2">
              <CreativesList key={refreshKey} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
