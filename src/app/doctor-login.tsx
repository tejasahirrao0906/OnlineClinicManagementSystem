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
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { auth, db } from '../firebaseConfig';

export default function DoctorLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const handleDoctorLogin = async () => {
    if (
      email.trim() === '' ||
      password.trim() === ''
    ) {
      Alert.alert(
        'Missing Details',
        'Please enter your email and password.',
      );
      return;
    }

    try {
      setLoading(true);

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password,
        );

      const user =
        userCredential.user;

      // Verify that the authenticated
      // Firebase account belongs to a
      // registered doctor.
      const doctorsQuery = query(
        collection(db, 'doctors'),
        where('uid', '==', user.uid),
      );

      const doctorsSnapshot =
        await getDocs(doctorsQuery);

      if (doctorsSnapshot.empty) {
        await signOut(auth);

        Alert.alert(
          'Access Denied',
          'This account is not registered as a doctor.',
        );

        return;
      }

      Alert.alert(
        'Login Successful',
        'Welcome back, Doctor!',
        [
          {
            text: 'Continue',
            onPress: () =>
              router.replace(
                '/doctor-dashboard',
              ),
          },
        ],
      );
    } catch (error: any) {
      console.log(
        'Doctor login error:',
        error,
      );

      if (
        error?.code ===
          'auth/invalid-credential' ||
        error?.code ===
          'auth/wrong-password' ||
        error?.code ===
          'auth/user-not-found'
      ) {
        Alert.alert(
          'Login Failed',
          'Invalid email or password.',
        );
      } else if (
        error?.code ===
        'auth/invalid-email'
      ) {
        Alert.alert(
          'Login Failed',
          'Please enter a valid email address.',
        );
      } else {
        Alert.alert(
          'Login Failed',
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
            Back to Home
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
            Doctor Login
          </Text>

          <Text style={styles.subtitle}>
            Sign in to access the doctor dashboard.
          </Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          {/* Email */}
          <Text style={styles.label}>
            Doctor Email
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
              placeholder="Enter doctor email"
              placeholderTextColor="#98A2B3"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              value={email}
              onChangeText={setEmail}
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
              placeholder="Enter password"
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

          {/* Security Notice */}
          <View style={styles.notice}>
            <Text style={styles.noticeIcon}>
              🛡️
            </Text>

            <Text style={styles.noticeText}>
              Doctor access is restricted to accounts
              linked with a registered doctor profile.
            </Text>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              loading &&
                styles.disabledButton,
            ]}
            onPress={handleDoctorLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View
                style={
                  styles.loadingContent
                }
              >
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.loginButtonText
                  }
                >
                  Signing In...
                </Text>
              </View>
            ) : (
              <Text
                style={
                  styles.loginButtonText
                }
              >
                → Doctor Login
              </Text>
            )}
          </TouchableOpacity>

          {/* Registration */}
          <View
            style={styles.registerContainer}
          >
            <Text
              style={styles.registerText}
            >
              New doctor?
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.push(
                  '/doctor-register',
                )
              }
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text
                style={styles.registerLink}
              >
                Create Account
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

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#344054',
    marginBottom: 7,
    marginTop: 5,
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
    marginBottom: 13,
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
    fontSize: 17,
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

  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F9FC',
    borderRadius: 12,
    padding: 11,
    marginTop: 1,
    marginBottom: 15,
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

  loginButton: {
    backgroundColor: '#1769AA',
    minHeight: 49,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    opacity: 0.7,
  },

  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },

  registerText: {
    color: '#718096',
    fontSize: 13,
  },

  registerLink: {
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