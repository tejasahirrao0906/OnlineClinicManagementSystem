import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
} from 'firebase/auth';

import {
  doc,
  setDoc,
} from 'firebase/firestore';

import { auth, db } from '../firebaseConfig';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] =
    useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const handleRegister = async () => {
    if (
      name.trim() === '' ||
      email.trim() === '' ||
      phone.trim() === '' ||
      password.trim() === '' ||
      confirmPassword.trim() === ''
    ) {
      Alert.alert(
        'Missing Details',
        'Please fill in all fields.',
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Password Mismatch',
        'Passwords do not match.',
      );
      return;
    }

    if (phone.length !== 10) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid 10-digit phone number.',
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 6 characters.',
      );
      return;
    }

    try {
      setLoading(true);

      // Create Firebase Authentication account
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );

      const user = userCredential.user;

      // Store additional user information in Firestore
      await setDoc(
        doc(db, 'users', user.uid),
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role: 'patient',
          createdAt:
            new Date().toISOString(),
        },
      );

      Alert.alert(
        'Registration Successful',
        `Welcome to Online Clinic, ${name.trim()}!`,
        [
          {
            text: 'Continue',
            onPress: () =>
              router.replace('/dashboard'),
          },
        ],
      );
    } catch (error: any) {
      console.log(
        'Registration error:',
        error,
      );

      if (
        error.code ===
        'auth/email-already-in-use'
      ) {
        Alert.alert(
          'Registration Failed',
          'An account with this email already exists.',
        );
      } else if (
        error.code ===
        'auth/invalid-email'
      ) {
        Alert.alert(
          'Registration Failed',
          'Please enter a valid email address.',
        );
      } else if (
        error.code ===
        'auth/weak-password'
      ) {
        Alert.alert(
          'Registration Failed',
          'Password is too weak. Use at least 6 characters.',
        );
      } else {
        Alert.alert(
          'Registration Failed',
          'Something went wrong. Please try again.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.container
        }
      >
        {/* Back */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>
            ←
          </Text>

          <Text style={styles.backText}>
            Back to Login
          </Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logo}>
              🏥
            </Text>
          </View>

          <Text style={styles.title}>
            Create Account
          </Text>

          <Text style={styles.subtitle}>
            Register to access Online Clinic services.
          </Text>
        </View>

        {/* Registration Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Patient Registration
          </Text>

          <Text style={styles.cardSubtitle}>
            Enter your details to create your patient
            account.
          </Text>

          {/* Full Name */}
          <Text style={styles.label}>
            Full Name
          </Text>

          <View
            style={[
              styles.inputContainer,
              loading &&
                styles.disabledInput,
            ]}
          >
            <View
              style={styles.inputIconBox}
            >
              <Text style={styles.inputIcon}>
                👤
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#98A2B3"
              autoCapitalize="words"
              editable={!loading}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email */}
          <Text style={styles.label}>
            Email Address
          </Text>

          <View
            style={[
              styles.inputContainer,
              loading &&
                styles.disabledInput,
            ]}
          >
            <View
              style={styles.inputIconBox}
            >
              <Text style={styles.inputIcon}>
                ✉
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#98A2B3"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Phone */}
          <Text style={styles.label}>
            Phone Number
          </Text>

          <View
            style={[
              styles.inputContainer,
              loading &&
                styles.disabledInput,
            ]}
          >
            <View
              style={styles.inputIconBox}
            >
              <Text style={styles.inputIcon}>
                📞
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit phone number"
              placeholderTextColor="#98A2B3"
              keyboardType="phone-pad"
              maxLength={10}
              editable={!loading}
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>
            Password
          </Text>

          <View
            style={[
              styles.inputContainer,
              loading &&
                styles.disabledInput,
            ]}
          >
            <View
              style={styles.inputIconBox}
            >
              <Text style={styles.inputIcon}>
                🔒
              </Text>
            </View>

            <TextInput
              style={styles.passwordInput}
              placeholder="Create a password"
              placeholderTextColor="#98A2B3"
              secureTextEntry={!showPassword}
              editable={!loading}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              onPress={() =>
                setShowPassword(
                  !showPassword,
                )
              }
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text
                style={
                  styles.showPasswordText
                }
              >
                {showPassword
                  ? 'Hide'
                  : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.passwordHint}>
            Password must contain at least 6 characters.
          </Text>

          {/* Confirm Password */}
          <Text style={styles.label}>
            Confirm Password
          </Text>

          <View
            style={[
              styles.inputContainer,
              loading &&
                styles.disabledInput,
            ]}
          >
            <View
              style={styles.inputIconBox}
            >
              <Text style={styles.inputIcon}>
                🔒
              </Text>
            </View>

            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm your password"
              placeholderTextColor="#98A2B3"
              secureTextEntry={
                !showConfirmPassword
              }
              editable={!loading}
              value={confirmPassword}
              onChangeText={
                setConfirmPassword
              }
            />

            <TouchableOpacity
              onPress={() =>
                setShowConfirmPassword(
                  !showConfirmPassword,
                )
              }
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text
                style={
                  styles.showPasswordText
                }
              >
                {showConfirmPassword
                  ? 'Hide'
                  : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Security Notice */}
          <View style={styles.notice}>
            <Text style={styles.noticeIcon}>
              🛡️
            </Text>

            <Text style={styles.noticeText}>
              Your patient account details are stored
              securely and can only be accessed through
              your authorized account.
            </Text>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              loading &&
                styles.disabledButton,
            ]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View
                style={
                  styles.loadingContainer
                }
              >
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.registerButtonText
                  }
                >
                  Creating Account...
                </Text>
              </View>
            ) : (
              <Text
                style={
                  styles.registerButtonText
                }
              >
                → Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View
            style={styles.loginContainer}
          >
            <Text style={styles.loginText}>
              Already have an account?
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.back()
              }
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLink}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerIcon}>
            🏥
          </Text>

          <Text style={styles.footerText}>
            Online Clinic Management System
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F9FC',
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 28,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 18,
  },

  backArrow: {
    fontSize: 21,
    color: '#1769AA',
    marginRight: 5,
  },

  backText: {
    color: '#1769AA',
    fontSize: 14,
    fontWeight: '700',
  },

  header: {
    alignItems: 'center',
    marginBottom: 22,
  },

  logoCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  logo: {
    fontSize: 39,
  },

  title: {
    fontSize: 29,
    fontWeight: '800',
    color: '#1769AA',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 19,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 5,
  },

  cardSubtitle: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 18,
    marginBottom: 8,
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
    height: 52,
    borderWidth: 1,
    borderColor: '#D5E2EC',
    borderRadius: 12,
    backgroundColor: '#F9FCFF',
    overflow: 'hidden',
  },

  inputIconBox: {
    width: 48,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2EAF0',
  },

  inputIcon: {
    fontSize: 16,
  },

  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1F2937',
  },

  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1F2937',
  },

  showPasswordText: {
    color: '#1769AA',
    fontSize: 13,
    fontWeight: '800',
    paddingHorizontal: 12,
  },

  disabledInput: {
    opacity: 0.65,
  },

  passwordHint: {
    fontSize: 10,
    color: '#98A2B3',
    marginTop: 5,
  },

  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F9FC',
    borderRadius: 12,
    padding: 11,
    marginTop: 14,
  },

  noticeIcon: {
    fontSize: 17,
    marginRight: 9,
  },

  noticeText: {
    flex: 1,
    fontSize: 10,
    color: '#718096',
    lineHeight: 15,
  },

  registerButton: {
    backgroundColor: '#1769AA',
    minHeight: 49,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },

  disabledButton: {
    opacity: 0.7,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },

  loginText: {
    color: '#718096',
    fontSize: 13,
  },

  loginLink: {
    color: '#1769AA',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 5,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 19,
  },

  footerIcon: {
    fontSize: 12,
    marginRight: 5,
  },

  footerText: {
    fontSize: 10,
    color: '#8A94A6',
  },
});