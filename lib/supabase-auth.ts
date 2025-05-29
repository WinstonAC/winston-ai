import { supabase } from './supabase';

// Updated to use environment variable for site URL
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const signInWithEmail = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error('Auth error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Auth error:', error);
    throw error;
  }
};

export const signInWithMagicLink = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: encodeURIComponent(email),
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
        data: {
          email: email // Store original email in user metadata
        }
      },
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Magic link error:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      console.error('Google auth error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Google auth error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Session error:', error);
      throw error;
    }
    return session;
  } catch (error) {
    console.error('Session error:', error);
    throw error;
  }
}; 