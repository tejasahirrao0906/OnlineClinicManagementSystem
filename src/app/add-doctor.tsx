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
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../firebaseConfig';

export default function AddDoctorScreen() {
  const [name, setName] = useState('');
  const [specialization, setSpecialization] =
    useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddDoctor = async () => {
    const cleanName = name.trim();
    const cleanSpecialization =
      specialization.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (
      !cleanName ||
      !cleanSpecialization ||
      !cleanEmail
    ) {
      Alert.alert(
        'Missing Details',
        'Please enter doctor name, specialization and email.',
      );
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid doctor email address.',
      );
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, 'doctors'), {
        name: cleanName,
        specialization: cleanSpecialization,
        email: cleanEmail,
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        'Doctor Added',
        `${cleanName} has been added successfully.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.log(
        'Add doctor error:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to add doctor. Please try again.',
      );
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>
              ←
            </Text>

            <Text style={styles.backText}>
              Back
            </Text>
          </TouchableOpacity>

          <View style={styles.headerRow}>
            <View style={styles.headerIconCircle}>
              <Text style={styles.headerIcon}>
                👨‍⚕️
              </Text>
            </View>

            <View style={styles.headerContent}>
              <Text style={styles.title}>
                Add Doctor
              </Text>

              <Text style={styles.subtitle}>
                Register a new doctor in the clinic
              </Text>
            </View>
          </View>
        </View>

        {/* Information Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconCircle}>
            <Text style={styles.infoIcon}>
              ℹ
            </Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Doctor Registration
            </Text>

            <Text style={styles.infoText}>
              Enter the doctor's basic details and
              email address. The doctor can use this
              email to complete account registration.
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            Doctor Information
          </Text>

          <Text style={styles.formSubtitle}>
            All fields are required
          </Text>

          {/* Doctor Name */}
          <Text style={styles.label}>
            Doctor Name
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>
              👤
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter doctor name"
              placeholderTextColor="#9AA3B2"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          {/* Specialization */}
          <Text style={styles.label}>
            Specialization
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>
              🩺
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Example: Cardiologist"
              placeholderTextColor="#9AA3B2"
              value={specialization}
              onChangeText={setSpecialization}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          {/* Email */}
          <Text style={styles.label}>
            Doctor Email
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>
              ✉
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter doctor email"
              placeholderTextColor="#9AA3B2"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <Text style={styles.emailHint}>
            This email will be used when linking the
            doctor's account.
          </Text>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              loading &&
                styles.saveButtonDisabled,
            ]}
            onPress={handleAddDoctor}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text
                  style={styles.saveButtonText}
                >
                  Adding Doctor...
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={styles.saveButtonIcon}
                >
                  +
                </Text>

                <Text
                  style={styles.saveButtonText}
                >
                  Add Doctor
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Security Note */}
        <View style={styles.securityCard}>
          <View style={styles.securityIconCircle}>
            <Text style={styles.securityIcon}>
              🔒
            </Text>
          </View>

          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>
              Admin Controlled
            </Text>

            <Text style={styles.securityText}>
              Only authorized administrators can add
              doctors to the clinic system.
            </Text>
          </View>
        </View>

        {/* Bottom Navigation */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>
            Cancel
          </Text>
        </TouchableOpacity>

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
    paddingTop: 35,
    paddingBottom: 35,
  },

  header: {
    marginBottom: 20,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },

  backArrow: {
    fontSize: 21,
    color: '#1769AA',
    marginRight: 5,
  },

  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1769AA',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIconCircle: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  headerIcon: {
    fontSize: 28,
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#1769AA',
  },

  subtitle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
    lineHeight: 18,
  },

  infoCard: {
    backgroundColor: '#EAF4FB',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#D5EAF7',
  },

  infoIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  infoIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1769AA',
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1769AA',
  },

  infoText: {
    fontSize: 11,
    color: '#52677A',
    lineHeight: 17,
    marginTop: 3,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },

  formSubtitle: {
    fontSize: 11,
    color: '#8A94A6',
    marginTop: 3,
    marginBottom: 16,
  },

  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 7,
    marginTop: 13,
  },

  inputContainer: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#D5DCE5',
    borderRadius: 11,
    backgroundColor: '#FAFCFE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  inputIcon: {
    fontSize: 17,
    width: 27,
    textAlign: 'center',
    marginRight: 7,
  },

  input: {
    flex: 1,
    minHeight: 50,
    fontSize: 14,
    color: '#1F2937',
  },

  emailHint: {
    fontSize: 10,
    color: '#8A94A6',
    lineHeight: 15,
    marginTop: 6,
  },

  saveButton: {
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: '#1769AA',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 24,
    elevation: 2,
    shadowColor: '#1769AA',
    shadowOpacity: 0.16,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveButtonIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '400',
    marginRight: 8,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  securityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 13,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5EAF0',
  },

  securityIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  securityIcon: {
    fontSize: 18,
  },

  securityContent: {
    flex: 1,
  },

  securityTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
  },

  securityText: {
    fontSize: 10,
    color: '#8A94A6',
    lineHeight: 15,
    marginTop: 2,
  },

  cancelButton: {
    minHeight: 45,
    borderRadius: 11,
    backgroundColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },

  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
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