import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';

const TOTAL_STEPS = 4;

// ── Progress Bar ─────────────────────────────────────────────────────────────
// Defined outside the main component so it never gets recreated
// Web equivalent: a row of divs with conditional background colours
function ProgressBar({ step }: { step: number }) {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.progressDot,
            i + 1 < step && styles.progressDone,
            i + 1 === step && styles.progressActive,
            i + 1 > step && styles.progressInactive,
          ]}
        />
      ))}
    </View>
  );
}

// ── Step 1 — First Name ───────────────────────────────────────────────────────
// Defined outside — receives value and setter as props
// Web equivalent: a controlled <input> component
function StepName({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (text: string) => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.stepContainer}>
      <ProgressBar step={1} />
      <View style={styles.textBlock}>
        <Text style={styles.stepTitle}>What's your first name?</Text>
        <Text style={styles.stepSubtitle}>
          This is how you'll appear to others on Involvve
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>FIRST NAME</Text>
        <TextInput
          style={styles.input}
          placeholder="Your first name..."
          placeholderTextColor="#3D5A47"
          value={value}
          onChangeText={onChange}
          autoFocus
          autoCapitalize="words"
        />
      </View>

      <View style={styles.spacer} />

      <TouchableOpacity
        style={[styles.primaryBtn, !value.trim() && styles.btnDisabled]}
        onPress={onNext}
        disabled={!value.trim()}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryBtnText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Step 2 — Date of Birth ────────────────────────────────────────────────────
// Uses the native iOS/Android date picker
// Web equivalent: <input type="date">
function StepDOB({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: Date | null;
  onChange: (date: Date) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [showPicker, setShowPicker] = useState(false);

  // Format date as readable string for display
  // e.g. May 15, 2000
  function formatDate(date: Date) {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <View style={styles.stepContainer}>
      <ProgressBar step={2} />
      <View style={styles.textBlock}>
        <Text style={styles.stepTitle}>When's your birthday?</Text>
        <Text style={styles.stepSubtitle}>
          You must be 18 or older to use Involvve
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>DATE OF BIRTH</Text>

        {/* Tappable field that opens the native date picker */}
        {/* Web equivalent: <input type="date"> */}
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowPicker(true)}
          activeOpacity={0.8}
        >
          <Text style={{ color: value ? '#B7E4C7' : '#3D5A47', fontSize: 15 }}>
            {value ? formatDate(value) : 'Select your date of birth'}
          </Text>
        </TouchableOpacity>

        {/* Native date picker — shows as a wheel on iOS */}
        {/* Only renders when showPicker is true */}
        {showPicker && (
          <DateTimePicker
            value={value || new Date(2000, 0, 1)}
            mode="date"
            display="spinner"
            maximumDate={new Date()} // Can't select future dates
            minimumDate={new Date(1900, 0, 1)}
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) onChange(selectedDate);
            }}
            themeVariant="dark"
          />
        )}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          🔒 Your birthday is never shown publicly. We use it only to verify your age.
        </Text>
      </View>

      <View style={styles.spacer} />

      <TouchableOpacity
        style={[styles.primaryBtn, !value && styles.btnDisabled]}
        onPress={onNext}
        disabled={!value}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryBtnText}>Continue</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.backBtn}>Go back</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Step 3 — Profile Photo ────────────────────────────────────────────────────
function StepPhoto({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <View style={styles.stepContainer}>
      <ProgressBar step={3} />
      <View style={styles.textBlock}>
        <Text style={styles.stepTitle}>Add a photo</Text>
        <Text style={styles.stepSubtitle}>
          A real photo helps people feel comfortable joining your group
        </Text>
      </View>

      <TouchableOpacity style={styles.photoUpload} activeOpacity={0.8}>
        <Text style={styles.photoIcon}>📷</Text>
        <Text style={styles.photoLabel}>Upload a photo</Text>
        <Text style={styles.photoSub}>Tap to choose from your library</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          ℹ️ A profile photo is required. No photo means no access to the app.
        </Text>
      </View>

      <View style={styles.spacer} />

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={onNext}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryBtnText}>Continue</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.backBtn}>Go back</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Step 4 — Location ─────────────────────────────────────────────────────────
function StepLocation({
  loading,
  onAllow,
  onSkip,
  onBack,
}: {
  loading: boolean;
  onAllow: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  return (
    <View style={styles.stepContainer}>
      <ProgressBar step={4} />
      <View style={styles.textBlock}>
        <Text style={styles.stepTitle}>Where are you based?</Text>
        <Text style={styles.stepSubtitle}>
          We'll show you activities happening near you
        </Text>
      </View>

      <View style={styles.locationCard}>
        <View style={styles.locationIcon}>
          <Text style={{ fontSize: 20 }}>📍</Text>
        </View>
        <View style={styles.locationText}>
          <Text style={styles.locationTitle}>Allow location access</Text>
          <Text style={styles.locationSub}>Used to find activities near you</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          🔒 Your exact location is never shared with other users.
        </Text>
      </View>

      <View style={styles.spacer} />

      {loading ? (
        <ActivityIndicator color="#52B788" style={{ marginBottom: 16 }} />
      ) : (
        <>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onAllow}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Allow location</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtnContainer}
            onPress={onSkip}
          >
            <Text style={styles.secondaryBtn}>Not now</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backBtn}>Go back</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// ── Main Onboarding Screen ────────────────────────────────────────────────────
// This is the orchestrator — it holds all the state and passes
// values down to each step as props
export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [locationGranted, setLocationGranted] = useState(false);

  function goNext() {
    if (step < TOTAL_STEPS) setStep(step + 1);
  }

  function goBack() {
    if (step > 1) setStep(step - 1);
  }

  async function handleLocationRequest() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') setLocationGranted(true);
      await completeOnboarding(status === 'granted');
    } catch {
      await completeOnboarding(false);
    }
  }

  async function handleSkipLocation() {
    await completeOnboarding(false);
  }

 async function completeOnboarding(granted: boolean) {
  try {
    setLoading(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Auth user:', user?.id);
    console.log('Auth error:', userError);

    if (!user) throw new Error('No user found');

    let locationPoint = null;
    if (granted) {
      const location = await Location.getCurrentPositionAsync({});
      locationPoint = `POINT(${location.coords.longitude} ${location.coords.latitude})`;
    }

    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        auth_provider: 'email',
        first_name: firstName.trim(),
        date_of_birth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : null,
        profile_photo_url: '',
        profile_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        current_location: locationPoint,
      })
      .select();

    console.log('Upsert data:', JSON.stringify(data));
    console.log('Upsert error:', JSON.stringify(error));

    if (error) throw error;

    router.replace('/(tabs)');

  } catch (err) {
    console.error('Onboarding error:', JSON.stringify(err));
  } finally {
    setLoading(false);
  }
}
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0A1A12' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && (
          <StepName
            value={firstName}
            onChange={setFirstName}
            onNext={goNext}
          />
        )}
        {step === 2 && (
          <StepDOB
                value={dateOfBirth}
                onChange={setDateOfBirth}
                onNext={goNext}
                onBack={goBack}
          />
        )}
        {step === 3 && (
          <StepPhoto
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {step === 4 && (
          <StepLocation
            loading={loading}
            onAllow={handleLocationRequest}
            onSkip={handleSkipLocation}
            onBack={goBack}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 48,
    minHeight: '100%',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 32,
  },
  progressDot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  progressActive: { backgroundColor: '#52B788' },
  progressDone: { backgroundColor: '#2D6A4F' },
  progressInactive: { backgroundColor: '#1B4332' },
  textBlock: {
    gap: 8,
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '500',
    color: '#F0FAF3',
    letterSpacing: -0.3,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#52B788',
    lineHeight: 22,
  },
  inputGroup: { gap: 6 },
  inputLabel: {
    fontSize: 10,
    color: '#3D5A47',
    fontWeight: '500',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#122318',
    borderWidth: 0.5,
    borderColor: '#1B4332',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#B7E4C7',
  },
  infoBox: {
    backgroundColor: '#122318',
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#3D5A47',
    lineHeight: 18,
  },
  spacer: { flex: 1 },
  primaryBtn: {
    backgroundColor: '#2D6A4F',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {
    color: '#D8F3DC',
    fontSize: 15,
    fontWeight: '600',
  },
  btnDisabled: { opacity: 0.4 },
  secondaryBtnContainer: {
    borderWidth: 0.5,
    borderColor: '#1B4332',
    borderRadius: 14,
    marginBottom: 10,
  },
  secondaryBtn: {
    color: '#52B788',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 14,
  },
  backBtn: {
    color: '#3D5A47',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
  photoUpload: {
    backgroundColor: '#122318',
    borderWidth: 0.5,
    borderColor: '#2D6A4F',
    borderStyle: 'dashed',
    borderRadius: 16,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoIcon: { fontSize: 32 },
  photoLabel: {
    fontSize: 14,
    color: '#52B788',
    fontWeight: '500',
  },
  photoSub: {
    fontSize: 12,
    color: '#3D5A47',
  },
  locationCard: {
    backgroundColor: '#122318',
    borderWidth: 0.5,
    borderColor: '#1B4332',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationIcon: {
    width: 44,
    height: 44,
    backgroundColor: '#1B4332',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: { flex: 1, gap: 3 },
  locationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F0FAF3',
  },
  locationSub: {
    fontSize: 12,
    color: '#52B788',
  },
});