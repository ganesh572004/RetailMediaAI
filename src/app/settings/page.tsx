'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/ThemeProvider';
import { Moon, Sun, Clock, Send, Loader2, Phone } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getWeeklyUsage, clearUsageDates, saveUserProfile, getUserProfile } from '@/lib/storage';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function SettingsPage() {
  const { theme, setTheme, appearance } = useTheme();
  const { data: session } = useSession();
  const [sendingReport, setSendingReport] = useState(false);
  const [weeklyReportEnabled, setWeeklyReportEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [savedPhoneNumber, setSavedPhoneNumber] = useState('');
  const [reportPreview, setReportPreview] = useState<{ chartUrl: string; message: string } | null>(null);

  // Load saved phone number
  React.useEffect(() => {
    const loadPhone = async () => {
      if (session?.user?.email) {
        const profile = await getUserProfile(session.user.email);
        if (profile?.phoneNumber) {
          setPhoneNumber(profile.phoneNumber);
          setSavedPhoneNumber(profile.phoneNumber);
        }
        // Theme is now handled by ThemeSync component globally
      }
    };
    loadPhone();
  }, [session?.user?.email]);

  const handleSavePhone = async () => {
    if (!session?.user?.email) return;
    setIsSavingPhone(true);
    try {
      await saveUserProfile(session.user.email, { phoneNumber });
      setSavedPhoneNumber(phoneNumber);
      setIsEditingPhone(false);
      alert("Phone number saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save phone number.");
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handleSendTestReport = async () => {
    if (!session?.user?.email) {
      alert("Please sign in to send a test report.");
      return;
    }

    setSendingReport(true);
    try {
      // Get real usage data from local storage
      const { labels, data, dates } = await getWeeklyUsage(session.user.email);

      const res = await fetch('/api/cron/weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: session.user.email,
          usageData: { labels, data } // Send the real data
        })
      });
      
      const responseData = await res.json();

      if (responseData.success) {
        if (responseData.emailSent) {
          alert(`Weekly report sent to ${session.user.email}! Data for this week has been cleared.`);
        } else {
          alert(`Report generated but email failed: ${responseData.emailError}. See preview below.`);
        }
        
        // Show preview regardless of email success
        if (responseData.chartUrl) {
          setReportPreview({
            chartUrl: responseData.chartUrl,
            message: responseData.message
          });
        }

        // Clear the data that was just reported
        await clearUsageDates(session.user.email, dates);
      } else {
        alert(`Failed to generate report: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error sending report.");
    } finally {
      setSendingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          
          <div className="space-y-6">
            {/* Theme Settings */}
            <Card className="bg-card-background border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Appearance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6">
                  Customize how RetailMediaAI looks on your device.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                      theme === 'light' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Sun className={`w-8 h-8 mb-3 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-medium">Light</span>
                    <span className="text-xs text-muted-foreground mt-1">Always Light</span>
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                      theme === 'dark' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Moon className={`w-8 h-8 mb-3 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-medium">Dark</span>
                    <span className="text-xs text-muted-foreground mt-1">Always Dark</span>
                  </button>

                  <button
                    onClick={() => setTheme('dynamic')}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                      theme === 'dynamic' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Clock className={`w-8 h-8 mb-3 ${theme === 'dynamic' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-medium">Dynamic</span>
                    <span className="text-xs text-muted-foreground mt-1">Auto-switch by time</span>
                  </button>
                </div>

                {theme === 'dynamic' && (
                  <div className="mt-6 p-4 bg-background rounded-lg border border-border">
                    <h4 className="text-sm font-medium mb-2">Current Dynamic State</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="capitalize text-primary font-semibold">{appearance} Mode</span>
                      <span>•</span>
                      <span>
                        {appearance === 'light' && 'Morning (7 AM - 11 AM)'}
                        {appearance === 'afternoon' && 'Afternoon (12 PM - 5 PM)'}
                        {appearance === 'dark' && 'Evening (6 PM - 12 AM)'}
                        {appearance === 'night' && 'Night (12 AM - 6 AM)'}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card-background border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Account Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Manage your contact information for secure sign-in.</p>
                <div className="space-y-4">
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <h4 className="font-medium text-foreground">Phone Number</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Add a phone number to use as an alternative sign-in method.
                    </p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <PhoneInput
                          placeholder="Enter phone number"
                          value={phoneNumber}
                          onChange={(value) => setPhoneNumber(value || '')}
                          defaultCountry="US"
                          international
                          countryCallingCodeEditable={false}
                          disabled={!!savedPhoneNumber && !isEditingPhone}
                          className={`flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${!!savedPhoneNumber && !isEditingPhone ? 'opacity-60' : ''}`}
                        />
                      </div>
                      {savedPhoneNumber && !isEditingPhone ? (
                        <Button onClick={() => setIsEditingPhone(true)} variant="outline">
                          Edit
                        </Button>
                      ) : (
                        <Button onClick={handleSavePhone} disabled={isSavingPhone}>
                          {isSavingPhone ? 'Saving...' : 'Save'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card-background border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Email notifications for new generations</span>
                    <input type="checkbox" className="toggle accent-primary" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-foreground block">Weekly performance report</span>
                      <span className="text-xs text-muted-foreground">Sent every Sunday at 9 AM</span>
                    </div>
                    <input 
                      type="checkbox" 
                      className="toggle accent-primary" 
                      checked={weeklyReportEnabled}
                      onChange={(e) => setWeeklyReportEnabled(e.target.checked)}
                    />
                  </div>
                  
                  {weeklyReportEnabled && (
                    <div className="mt-4 p-4 bg-background rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-foreground">Test Weekly Report</h4>
                          <p className="text-xs text-muted-foreground">Send a sample report to your email now</p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={handleSendTestReport} 
                          disabled={sendingReport}
                        >
                          {sendingReport ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-3 w-3" />
                              Send Now
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {reportPreview && (
                    <div className="mt-6 p-4 bg-background rounded-lg border border-border animate-in fade-in slide-in-from-top-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-foreground">Report Preview</h4>
                        <Button variant="ghost" size="sm" onClick={() => setReportPreview(null)}>Close</Button>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <img src={reportPreview.chartUrl} alt="Weekly Activity Chart" className="w-full rounded shadow-sm" />
                        </div>
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                          <h5 className="text-sm font-semibold text-primary mb-1">💡 Weekly Giggle</h5>
                          <p className="text-sm text-muted-foreground italic">"{reportPreview.message}"</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
