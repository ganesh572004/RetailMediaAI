import React, { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { DashboardForm } from '@/components/DashboardForm';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="flex justify-center p-8 text-foreground">Loading dashboard...</div>}>
          <DashboardForm />
        </Suspense>
      </main>
    </div>
  );
}
