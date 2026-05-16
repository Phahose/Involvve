import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);

  // ── DEV BYPASS ────────────────────────────────────────────────────────────
  // Temporary sign in using a test Supabase account.
  // REPLACE with real Google + Apple OAuth after EAS dev build is set up.
  // See tech doc Section 8 for the full OAuth setup plan.
  async function handleSignIn() {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: 'dev@involvve.com',
        password: 'devpassword123',
      });

      if (error) throw error;

      // Navigate to main app — replace so user can't go back to auth
      // Web equivalent: window.location.replace('/feed')
      router.replace('/(tabs)');

    } catch (err) {
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>

      {/* Background glow */}
      <View style={styles.glow} />

      {/* Logo area */}
      <View style={styles.logoArea}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>involvve</Text>
        <Text style={styles.tagline}>
          Don't go alone. Find your people before you show up.
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.bottom}>

        {/* Apple — dev bypass for now */}
        <TouchableOpacity
          style={[styles.appleBtn, loading && styles.btnDisabled]}
          onPress={handleSignIn}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0A1A12" />
          ) : (
            <Text style={styles.appleBtnText}>Continue with Apple</Text>
          )}
        </TouchableOpacity>

        {/* Google — dev bypass for now */}
        <TouchableOpacity
          style={[styles.googleBtn, loading && styles.btnDisabled]}
          onPress={handleSignIn}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#52B788" />
          ) : (
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          )}
        </TouchableOpacity>

        {/* Dev mode indicator — remove before launch */}
        <Text style={styles.devNote}>⚠️ Dev bypass — real OAuth coming after EAS build</Text>

        {/* Terms */}
        <Text style={styles.terms}>
          By continuing you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1A12',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(45, 106, 79, 0.12)',
    top: 120,
    alignSelf: 'center',
  },
  logoArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  logo: {
    width: 72,
    height: 72,
  },
  appName: {
    fontSize: 30,
    fontWeight: '500',
    color: '#F0FAF3',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: '#52B788',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 240,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 10,
  },
  appleBtn: {
    backgroundColor: '#F0FAF3',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  appleBtnText: {
    color: '#0A1A12',
    fontSize: 15,
    fontWeight: '600',
  },
  googleBtn: {
    backgroundColor: '#122318',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#1B4332',
  },
  googleBtnText: {
    color: '#B7E4C7',
    fontSize: 15,
    fontWeight: '500',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  devNote: {
    fontSize: 10,
    color: '#3D5A47',
    textAlign: 'center',
  },
  terms: {
    fontSize: 11,
    color: '#3D5A47',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  termsLink: {
    color: '#52B788',
  },
});