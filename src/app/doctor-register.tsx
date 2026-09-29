import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import {
  createUserWithEmailAndPassword,
  deleteUser,
} from 'firebase/auth';

import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

import { auth, db } from '../firebaseConfig';

export default function DoctorRegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const handleDoctorRegister = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (
      !cleanEmail ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        'Missing Details',
        'Please fill in all fields.'
      );
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address.'
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 6 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Password Mismatch',
        'Passwords do not match.'
      );
      return;
    }

    try {
      setLoading(true);

      // Create Firebase Authentication account.
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password,
        );

      const user = userCredential.user;

      console.log(
        'Doctor Firebase Auth UID:',
        user.uid,
      );

      // Find the doctor profile using
      // the registered email.
      const doctorsQuery = query(
        collection(db, 'doctors'),
        where('email', '==', cleanEmail),
      );

      const doctorsSnapshot =
        await getDocs(doctorsQuery);

      // No doctor profile found.
      if (doctorsSnapshot.empty) {
        // Remove the newly-created Auth account
        // so an unused account is not left behind.
        await deleteUser(user);

        Alert.alert(
          'Doctor Not Found',
          'No doctor profile was found with this email. Please contact the clinic administrator.',
        );

        return;
      }

      // Make sure there is exactly one
      // matching doctor profile.
      if (doctorsSnapshot.size > 1) {
        await deleteUser(user);

        Alert.alert(
          'Registration Failed',
          'Multiple doctor profiles use this email. Please contact the clinic administrator.',
        );

        return;
      }

      const doctorDocument =
        doctorsSnapshot.docs[0];

      const doctorData =
        doctorDocument.data();

      // Prevent an already-linked doctor
      // profile from being linked again.
      if (doctorData.uid) {
        await deleteUser(user);

        Alert.alert(
          'Already Registered',
          'A doctor account is already linked to this email.',
        );

        return;
      }

      // Link the Firebase Authentication UID
      // to the existing doctor profile.
      await updateDoc(
        doctorDocument.ref,
        {
          uid: user.uid,
        },
      );

      Alert.alert(
        'Registration Successful',
        'Your doctor account has been created and linked successfully.',
        [
          {
            text: 'Continue',
            onPress: () =>
              router.replace('/doctor-login'),
          },
        ],
      );
    } catch (error: any) {
      console.log(
        'Doctor registration error:',
        error,
      );

      if (
        error.code ===
        'auth/email-already-in-use'
      ) {
        Alert.alert(
          'Registration Failed',
          'An account with this email already exists.'
        );
      } else if (
        error.code === 'auth/invalid-email'
      ) {
        Alert.alert(
          'Registration Failed',
          'Please enter a valid email address.'
        );
      } else if (
        error.code === 'auth/weak-password'
      ) {
        Alert.alert(
          'Registration Failed',
          'Password is too weak. Use at least 6 characters.'
        );
      } else if (
        error.code === 'permission-denied'
      ) {
        Alert.alert(
          'Registration Failed',
          'The doctor account could not be linked. Please contact the clinic administrator.'
        );
      } else {
        Alert.alert(
          'Registration Failed',
          'Something went wrong. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Back */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        disabled={loading}
        activeOpacity={0.7}
      >
        <Text style={styles.backArrow}>‹</Text>

        <Text style={styles.backText}>
          Back
        </Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logo}>
            👨‍⚕️
          </Text>
        </View>

        <Text style={styles.title}>
          Doctor Registration
        </Text>

        <Text style={styles.subtitle}>
          Create your account using the email
          registered by the clinic
        </Text>
      </View>

      {/* Registration Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <Text style={styles.cardHeaderIconText}>
              🩺
            </Text>
          </View>

          <View style={styles.cardHeaderInfo}>
            <Text style={styles.cardTitle}>
              Create Doctor Account
            </Text>

            <Text style={styles.cardSubtitle}>
              Your email must already be registered by
              the administrator
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Email */}
        <Text style={styles.label}>
          Registered Email
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>
            ✉
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter registered doctor email"
            placeholderTextColor="#98A2B3"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
        </View>

        {/* Password */}
        <Text style={styles.label}>
          Password
        </Text>

        <View style={styles.passwordContainer}>
          <Text style={styles.inputIcon}>
            🔒
          </Text>

          <TextInput
            style={styles.passwordInput}
            placeholder="Create a password"
            placeholderTextColor="#98A2B3"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <TouchableOpacity
            onPress={() =>
              setShowPassword(!showPassword)
            }
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.showText}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.helperText}>
          Password must contain at least 6 characters.
        </Text>

        {/* Confirm Password */}
        <Text style={styles.label}>
          Confirm Password
        </Text>

        <View style={styles.passwordContainer}>
          <Text style={styles.inputIcon}>
            🔒
          </Text>

          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm your password"
            placeholderTextColor="#98A2B3"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
          />

          <TouchableOpacity
            onPress={() =>
              setShowConfirmPassword(
                !showConfirmPassword
              )
            }
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.showText}>
              {showConfirmPassword
                ? 'Hide'
                : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={[
            styles.registerButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleDoctorRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <View style={styles.loadingContent}>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text
                style={styles.registerButtonText}
              >
                Creating Account...
              </Text>
            </View>
          ) : (
            <View style={styles.loadingContent}>
              <Text
                style={styles.registerButtonIcon}
              >
                ✓
              </Text>

              <Text
                style={styles.registerButtonText}
              >
                Create Doctor Account
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Information */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>
            ℹ️
          </Text>

          <Text style={styles.infoText}>
            Only doctors whose email has been added by
            the clinic administrator can create an
            account.
          </Text>
        </View>

        {/* Login */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() =>
            router.replace('/doctor-login')
          }
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.loginText}>
            Already have an account?
          </Text>

          <Text style={styles.loginLink}>
            {' '}Doctor Login
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F9FC',
    padding: 20,
    paddingTop: 45,
    paddingBottom: 40,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 18,
  },

  backArrow: {
    fontSize: 29,
    lineHeight: 29,
    color: '#1769AA',
    marginRight: 4,
    marginTop: -2,
  },

  backText: {
    color: '#1769AA',
    fontSize: 15,
    fontWeight: '700',
  },

  header: {
    alignItems: 'center',
    marginBottom: 24,
  },

  logoCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  logo: {
    fontSize: 42,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1769AA',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 13,
    color: '#667085',
    marginTop: 7,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cardHeaderIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  cardHeaderIconText: {
    fontSize: 23,
  },

  cardHeaderInfo: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },

  cardSubtitle: {
    fontSize: 11,
    color: '#8A94A6',
    marginTop: 3,
    lineHeight: 16,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF1F4',
    marginVertical: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#344054',
    marginBottom: 7,
    marginTop: 10,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5E2EC',
    borderRadius: 13,
    backgroundColor: '#F9FCFF',
    paddingHorizontal: 12,
  },

  inputIcon: {
    width: 28,
    fontSize: 16,
    textAlign: 'center',
    marginRight: 7,
    color: '#667085',
  },

  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5E2EC',
    borderRadius: 13,
    paddingHorizontal: 12,
    backgroundColor: '#F9FCFF',
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
  },

  showText: {
    color: '#1769AA',
    fontWeight: '700',
    fontSize: 13,
    paddingLeft: 8,
  },

  helperText: {
    fontSize: 11,
    color: '#98A2B3',
    marginTop: 5,
    marginLeft: 2,
  },

  registerButton: {
    backgroundColor: '#1769AA',
    height: 52,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },

  disabledButton: {
    opacity: 0.7,
  },

  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  registerButtonIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F7FC',
    borderRadius: 13,
    padding: 12,
    marginTop: 17,
  },

  infoIcon: {
    fontSize: 15,
    marginRight: 8,
  },

  infoText: {
    flex: 1,
    fontSize: 11,
    color: '#667085',
    lineHeight: 17,
  },

  loginButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 19,
  },

  loginText: {
    color: '#667085',
    fontSize: 13,
  },

  loginLink: {
    color: '#1769AA',
    fontSize: 13,
    fontWeight: '800',
  },
});