import localforage from 'localforage';

localforage.config({
  name: 'RetailMediaAI',
  storeName: 'creatives_store'
});

export interface Creative {
  id: string;
  productName: string;
  brandName: string;
  imageData: string;
  date: string;
  platform: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  adTemplate?: string;
}

export const saveCreative = async (email: string, creative: Creative) => {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase();
  try {
    const key = `myCreatives_${normalizedEmail}`;
    const existing: Creative[] = (await localforage.getItem(key)) || [];
    const index = existing.findIndex(c => c.id === creative.id);
    
    if (index >= 0) {
      existing[index] = creative;
    } else {
      existing.push(creative);
    }
    
    await localforage.setItem(key, existing);
    return true;
  } catch (error) {
    console.error('Failed to save creative:', error);
    throw error;
  }
};

export const getCreatives = async (email: string): Promise<Creative[]> => {
  if (!email) return [];
  const normalizedEmail = email.toLowerCase();
  try {
    return (await localforage.getItem(`myCreatives_${normalizedEmail}`)) || [];
  } catch (error) {
    console.error('Failed to get creatives:', error);
    return [];
  }
};

export const getCreativeById = async (email: string, id: string): Promise<Creative | undefined> => {
  const creatives = await getCreatives(email);
  return creatives.find(c => c.id === id);
};

export const deleteCreative = async (email: string, id: string) => {
  const creatives = await getCreatives(email);
  const updated = creatives.filter(c => c.id !== id);
  const normalizedEmail = email.toLowerCase();
  await localforage.setItem(`myCreatives_${normalizedEmail}`, updated);
  return updated;
};

// Autosave functions
export const saveAutosave = async (email: string, data: any) => {
    if (!email) return;
    const normalizedEmail = email.toLowerCase();
    await localforage.setItem(`dashboard_autosave_${normalizedEmail}`, data);
};

export const getAutosave = async (email: string) => {
    if (!email) return null;
    const normalizedEmail = email.toLowerCase();
    return await localforage.getItem(`dashboard_autosave_${normalizedEmail}`);
};

// User Profile functions
export interface UserProfile {
  name?: string;
  email?: string;
  image?: string;
  role?: string;
  phoneNumber?: string;
  theme?: 'light' | 'dark' | 'dynamic';
}

export const saveUserProfile = async (email: string, profile: UserProfile) => {
  if (!email) return;
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const key = `user_profile_${normalizedEmail}`;
    const current = (await getUserProfile(normalizedEmail)) || {};
    await localforage.setItem(key, { ...current, ...profile });
    
    // Save phone mapping if phone number exists
    if (profile.phoneNumber) {
      await localforage.setItem(`phone_map_${profile.phoneNumber}`, normalizedEmail);
    }
  } catch (error) {
    console.error('Failed to save user profile:', error);
  }
};

export const getEmailByPhone = async (phone: string): Promise<string | null> => {
  try {
    // 1. Try exact match
    const exactMatch = await localforage.getItem<string>(`phone_map_${phone}`);
    if (exactMatch) return exactMatch;

    // 2. Try fuzzy match (iterate through all phone keys)
    // This is needed because user might type '7569102138' but we saved '+917569102138'
    let foundEmail: string | null = null;
    
    await localforage.iterate((value, key) => {
      if (key.startsWith('phone_map_')) {
        const savedPhone = key.replace('phone_map_', '');
        // Check if the saved phone ends with the input phone (or vice versa)
        // e.g. saved: +917569102138, input: 7569102138 -> Match
        if (savedPhone.includes(phone) || phone.includes(savedPhone)) {
          foundEmail = value as string;
          return foundEmail; // Stop iteration
        }
      }
    });

    return foundEmail;
  } catch (error) {
    console.error('Failed to get email by phone:', error);
    return null;
  }
};

export const getUserProfile = async (email: string): Promise<UserProfile | null> => {
  if (!email) return null;
  const normalizedEmail = email.trim().toLowerCase();
  try {
    return await localforage.getItem(`user_profile_${normalizedEmail}`);
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }
};

// Welcome Email functions
export const hasWelcomeEmailBeenSent = async (email: string): Promise<boolean> => {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase();
  const val = await localforage.getItem(`welcome_email_sent_${normalizedEmail}`);
  return val === true;
};

export const setWelcomeEmailSent = async (email: string) => {
  if (!email) return;
  const normalizedEmail = email.toLowerCase();
  await localforage.setItem(`welcome_email_sent_${normalizedEmail}`, true);
};

// Usage Tracking Functions
export const updateUsageTime = async (email: string) => {
  if (!email) return;
  const normalizedEmail = email.toLowerCase();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const key = `usage_stats_${normalizedEmail}`;
  
  try {
    const stats: Record<string, number> = (await localforage.getItem(key)) || {};
    stats[today] = (stats[today] || 0) + 1; // Increment by 1 minute
    await localforage.setItem(key, stats);
  } catch (error) {
    console.error('Failed to update usage stats:', error);
  }
};

export const getWeeklyUsage = async (email: string) => {
  if (!email) return { labels: [], data: [], dates: [] };
  
  const normalizedEmail = email.toLowerCase();
  const key = `usage_stats_${normalizedEmail}`;
  const stats: Record<string, number> = (await localforage.getItem(key)) || {};
  
  const labels = [];
  const data = [];
  const dates: string[] = [];
  
  // Get last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    
    labels.push(dayName);
    data.push(stats[dateStr] || 0);
    dates.push(dateStr);
  }
  
  return { labels, data, dates };
};

export const clearUsageDates = async (email: string, datesToClear: string[]) => {
  if (!email || !datesToClear.length) return;
  const normalizedEmail = email.toLowerCase();
  const key = `usage_stats_${normalizedEmail}`;
  try {
    const stats: Record<string, number> = (await localforage.getItem(key)) || {};
    datesToClear.forEach(date => {
      delete stats[date];
    });
    await localforage.setItem(key, stats);
  } catch (error) {
    console.error('Failed to clear usage stats:', error);
  }
};

export const registerUser = async (authData: any) => {
  const { email, password, firstName, lastName, role } = authData;
  const normalizedEmail = email.toLowerCase();
  try {
    // Check if user already exists (auth OR profile)
    const existingAuth = await localforage.getItem(`user_auth_${normalizedEmail}`);
    const existingProfile = await localforage.getItem(`user_profile_${normalizedEmail}`);
    
    if (existingAuth || existingProfile) {
      throw new Error('User already exists');
    }

    // Save auth data (password)
    await localforage.setItem(`user_auth_${normalizedEmail}`, { password });

    // Save profile data
    await saveUserProfile(normalizedEmail, { 
      name: `${firstName} ${lastName}`,
      role 
    });
    
    return true;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const validateUserCredentials = async (email: string, passwordInput: string) => {
  const normalizedEmail = email.toLowerCase();
  try {
    const auth: any = await localforage.getItem(`user_auth_${normalizedEmail}`);
    
    if (!auth) {
        // Check if profile exists (e.g. Google user who hasn't set password)
        const profile = await localforage.getItem(`user_profile_${normalizedEmail}`);
        if (profile) {
             // User exists but has no password set
             return { isValid: false, error: 'Please sign in with Google or reset your password.' };
        }
        return { isValid: false, error: 'User not found' };
    }
    
    if (auth.password !== passwordInput) {
      return { isValid: false, error: 'Invalid password' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Validation error' };
  }
};

export const checkUserExists = async (email: string) => {
  const normalizedEmail = email.toLowerCase();
  const auth = await localforage.getItem(`user_auth_${normalizedEmail}`);
  const profile = await localforage.getItem(`user_profile_${normalizedEmail}`);
  return !!auth || !!profile;
};

export const updateUserPassword = async (email: string, password: string) => {
  const normalizedEmail = email.toLowerCase();
  try {
    // Ensure we don't overwrite existing profile, just update/create auth
    await localforage.setItem(`user_auth_${normalizedEmail}`, { password });
    return true;
  } catch (error) {
    console.error('Failed to update password:', error);
    throw error;
  }
};
