import { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // ── Check if user has completed onboarding ─────────────────────────────────
  // Returns true if user has a row with profile_completed = true
  const checkOnboarding = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('profile_completed')
        .eq('id', userId)
        .maybeSingle(); // maybeSingle returns null instead of error when no row found

      console.log('checkOnboarding data:', JSON.stringify(data));
      console.log('checkOnboarding error:', JSON.stringify(error));

      const complete = !!(data?.profile_completed === true);
      console.log('onboardingComplete:', complete);
      return complete;

    } catch (err) {
      console.log('checkOnboarding catch:', err);
      return false;
    }
  }, []);

  // ── Initialize auth on app open ────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session) {
          // Check onboarding before setting any state
          const complete = await checkOnboarding(session.user.id);
          if (!mounted) return;
          setSession(session);
          setOnboardingComplete(complete);
        } else {
          setSession(null);
          setOnboardingComplete(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initialize();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth event:', event);

        if (session) {
          const complete = await checkOnboarding(session.user.id);
          if (!mounted) return;
          setSession(session);
          setOnboardingComplete(complete);
        } else {
          setSession(null);
          setOnboardingComplete(false);
        }

        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkOnboarding]);

  // Show spinner while initializing
  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#0A1A12',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ActivityIndicator color="#52B788" size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!session ? (
        <Stack.Screen name="(auth)" />
      ) : !onboardingComplete ? (
        <Stack.Screen name="(onboarding)" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}