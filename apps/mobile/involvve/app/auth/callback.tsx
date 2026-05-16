import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // When this screen loads it means Supabase just redirected
    // back to our app after Google/Apple sign in.
    // We check if a session exists and navigate accordingly.
    // Think of this like the /auth/callback page on a web app
    // that reads the token from the URL and redirects to dashboard.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Session exists — user is logged in
        // Replace means they can't go back to this screen
        // Web equivalent: window.location.replace('/feed')
        router.replace('/(tabs)');
      } else {
        // Something went wrong — send back to auth
        router.replace('/(auth)');
      }
    });
  }, []);

  // While processing show a simple loading screen
  // This screen is only visible for a split second
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