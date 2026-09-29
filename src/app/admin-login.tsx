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
} from 'firebase/auth';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import { auth, db } from '../firebaseConfig';

export default function AdminLoginScreen() {
  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const handleAdminLogin = async () => {
    if (
      !email.trim() ||
      !password.trim()
    ) {
      Alert.alert(
        'Missing Details',
        'Please enter admin email and password.',
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

      console.log(
        'ADMIN AUTH SUCCESS:',
        user.uid,
        user.email,
      );

      const adminRef = doc(
        db,
        'adminUsers',
        user.uid,
      );

      const adminSnapshot =
        await getDoc(adminRef);

      if (!adminSnapshot.exists()) {
        await auth.signOut();

        Alert.alert(
          'Access Denied',
          'This account is not authorized as an administrator.',
        );

        return;
      }

      const adminData =
        adminSnapshot.data();

      if (
        adminData.role !== 'admin'
      ) {
        await auth.signOut();

        Alert.alert(
          'Access Denied',
          'This account does not have administrator access.',
        );

        return;
      }

      Alert.alert(
        'Login Successful',
        'Welcome to the Admin Dashboard.',
        [
          {
            text: 'Continue',
            onPress: () => {
              router.replace(
                '/admin-dashboard',
              );
            },
          },
        ],
      );
    } catch (error) {
      console.log(
        'Admin login error:',
        error,
      );

      Alert.alert(
        'Login Failed',
        'Invalid email or password. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.back()
            }
            disabled={loading}
          >
            <Text style={styles.backIcon}>
              ‹
            </Text>
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <Text style={styles.icon}>
              🔐
            </Text>
          </View>

          <Text style={styles.title}>
            Admin Login
          </Text>

          <Text style={styles.subtitle}>
            Sign in to access the clinic
            administration panel.
          </Text>
        </View>

        {/* Login Card */}
        <View style={styles.formCard}>
          {/* Email */}
          <Text style={styles.label}>
            Admin Email
          </Text>

          <View
            style={styles.inputContainer}
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
              placeholder="Enter admin email"
              placeholderTextColor="#9AA3B2"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>
            Password
          </Text>

          <View
            style={styles.inputContainer}
          >
            <View
              style={styles.inputIconBox}
            >
              <Text style={styles.inputIcon}>
                🔒
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#9AA3B2"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={
                !showPassword
              }
              editable={!loading}
            />

            <TouchableOpacity
              style={
                styles.passwordButton
              }
              onPress={() =>
                setShowPassword(
                  !showPassword,
                )
              }
              disabled={loading}
            >
              <Text
                style={
                  styles.passwordButtonText
                }
              >
                {showPassword
                  ? 'Hide'
                  : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Security Note */}
          <View
            style={styles.securityNote}
          >
            <Text
              style={styles.securityIcon}
            >
              🛡️
            </Text>

            <Text
              style={styles.securityText}
            >
              Administrator access is restricted
              to authorized clinic accounts.
            </Text>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              loading &&
                styles.disabledButton,
            ]}
            onPress={handleAdminLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <>
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
              </>
            ) : (
              <>
                <Text
                  style={
                    styles.loginButtonIcon
                  }
                >
                  →
                </Text>

                <Text
                  style={
                    styles.loginButtonText
                  }
                >
                  Admin Login
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Information */}
        <View
          style={styles.bottomInfo}
        >
          <Text
            style={styles.bottomIcon}
          >
            🏥
          </Text>

          <Text
            style={styles.bottomText}
          >
            Online Clinic Management System
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FC',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 35,
  },

  header: {
    alignItems: 'center',
    marginBottom: 22,
  },

  backButton: {
    alignSelf: 'flex-start',
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  backIcon: {
    color: '#1769AA',
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '400',
  },

  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  icon: {
    fontSize: 36,
  },

  title: {
    fontSize: 29,
    fontWeight: '800',
    color: '#1769AA',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 21,
    maxWidth: 330,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 19,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 7,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 51,
    borderWidth: 1,
    borderColor: '#D5DDE5',
    borderRadius: 12,
    backgroundColor: '#FAFCFE',
    marginBottom: 5,
  },

  inputIconBox: {
    width: 43,
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },

  inputIcon: {
    fontSize: 16,
  },

  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#222',
  },

  passwordButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  passwordButtonText: {
    color: '#1769AA',
    fontSize: 12,
    fontWeight: '800',
  },

  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 11,
    padding: 11,
    marginTop: 14,
  },

  securityIcon: {
    fontSize: 15,
    marginRight: 7,
  },

  securityText: {
    flex: 1,
    fontSize: 11,
    color: '#718096',
    lineHeight: 17,
  },

  loginButton: {
    backgroundColor: '#1769AA',
    minHeight: 51,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 20,
  },

  disabledButton: {
    backgroundColor: '#8AAFCB',
  },

  loginButtonIcon: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    marginRight: 8,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  bottomIcon: {
    fontSize: 14,
    marginRight: 6,
  },

  bottomText: {
    fontSize: 10,
    color: '#8A94A6',
  },
});