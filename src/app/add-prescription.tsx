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

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '../firebaseConfig';

export default function AddPrescriptionScreen() {
  const params = useLocalSearchParams();

  const appointmentId = String(
    params.appointmentId || '',
  );

  const patientId = String(
    params.patientId || '',
  );

  const doctorName = String(
    params.doctorName || 'Doctor',
  );

  const [medicineName, setMedicineName] =
    useState('');

  const [dosage, setDosage] =
    useState('');

  const [duration, setDuration] =
    useState('');

  const [instructions, setInstructions] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const savePrescription = async () => {
    if (
      medicineName.trim() === '' ||
      dosage.trim() === '' ||
      duration.trim() === '' ||
      instructions.trim() === ''
    ) {
      Alert.alert(
        'Missing Information',
        'Please fill in all prescription fields.',
      );

      return;
    }

    if (!appointmentId || !patientId) {
      Alert.alert(
        'Error',
        'Appointment or patient information is missing.',
      );

      return;
    }

    try {
      setSaving(true);

      const user = auth.currentUser;

      if (!user) {
        Alert.alert(
          'Login Required',
          'Please login as a doctor first.',
        );

        router.replace('/doctor-login');

        return;
      }

      await addDoc(
        collection(db, 'prescriptions'),
        {
          appointmentId,
          patientId,
          doctorId: user.uid,
          doctorName,
          medicineName:
            medicineName.trim(),
          dosage: dosage.trim(),
          duration: duration.trim(),
          instructions:
            instructions.trim(),
          createdAt: serverTimestamp(),
        },
      );

      Alert.alert(
        'Prescription Saved',
        'The prescription has been saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.log(
        'Prescription saving error:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to save prescription. Please try again.',
      );
    } finally {
      setSaving(false);
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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.content
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ‹
            </Text>
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              Add Prescription
            </Text>

            <Text style={styles.subtitle}>
              Create a prescription for your patient
            </Text>
          </View>
        </View>

        {/* Patient / Doctor Information */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIcon}>
                🩺
              </Text>
            </View>

            <View>
              <Text style={styles.infoHeaderTitle}>
                Prescription Details
              </Text>

              <Text style={styles.infoHeaderSubtitle}>
                Linked to the current appointment
              </Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                Doctor
              </Text>

              <Text
                style={styles.infoValue}
                numberOfLines={1}
              >
                {doctorName}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                Patient ID
              </Text>

              <Text
                style={styles.infoValue}
                numberOfLines={1}
              >
                {patientId}
              </Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>
              Medicine Information
            </Text>

            <Text style={styles.requiredText}>
              * Required
            </Text>
          </View>

          {/* Medicine Name */}
          <Text style={styles.label}>
            Medicine Name
          </Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Text style={styles.inputIcon}>
                💊
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Example: Paracetamol"
              placeholderTextColor="#9AA3B2"
              value={medicineName}
              onChangeText={setMedicineName}
              editable={!saving}
              autoCapitalize="words"
            />
          </View>

          {/* Dosage */}
          <Text style={styles.label}>
            Dosage
          </Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Text style={styles.inputIcon}>
                💉
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Example: 500 mg"
              placeholderTextColor="#9AA3B2"
              value={dosage}
              onChangeText={setDosage}
              editable={!saving}
            />
          </View>

          {/* Duration */}
          <Text style={styles.label}>
            Duration
          </Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Text style={styles.inputIcon}>
                🗓️
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Example: 5 days"
              placeholderTextColor="#9AA3B2"
              value={duration}
              onChangeText={setDuration}
              editable={!saving}
            />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsLabelRow}>
            <Text style={styles.label}>
              Instructions
            </Text>

            <Text style={styles.optionalHint}>
              Patient guidance
            </Text>
          </View>

          <View
            style={[
              styles.inputContainer,
              styles.textAreaContainer,
            ]}
          >
            <View
              style={[
                styles.inputIconBox,
                styles.textAreaIconBox,
              ]}
            >
              <Text style={styles.inputIcon}>
                📝
              </Text>
            </View>

            <TextInput
              style={[
                styles.input,
                styles.textArea,
              ]}
              placeholder="Example: Take after food, twice daily"
              placeholderTextColor="#9AA3B2"
              value={instructions}
              onChangeText={setInstructions}
              editable={!saving}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.helperText}>
            Include important instructions such as
            timing, frequency, or special precautions.
          </Text>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              saving &&
                styles.disabledButton,
            ]}
            onPress={savePrescription}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  Saving Prescription...
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={
                    styles.saveButtonIcon
                  }
                >
                  ✓
                </Text>

                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  Save Prescription
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Security / Information Note */}
        <View style={styles.noteCard}>
          <View style={styles.noteIconCircle}>
            <Text style={styles.noteIcon}>
              🔒
            </Text>
          </View>

          <View style={styles.noteContent}>
            <Text style={styles.noteTitle}>
              Prescription Record
            </Text>

            <Text style={styles.noteText}>
              This prescription will be securely
              associated with this patient and
              appointment.
            </Text>
          </View>
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

  content: {
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  backText: {
    color: '#1769AA',
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '400',
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#1769AA',
  },

  subtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 3,
  },

  infoCard: {
    backgroundColor: '#1769AA',
    borderRadius: 20,
    padding: 17,
    marginBottom: 18,
  },

  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor:
      'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  infoIcon: {
    fontSize: 22,
  },

  infoHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  infoHeaderSubtitle: {
    fontSize: 11,
    color: '#DCEEFF',
    marginTop: 3,
  },

  infoDivider: {
    height: 1,
    backgroundColor:
      'rgba(255,255,255,0.20)',
    marginVertical: 15,
  },

  infoRow: {
    flexDirection: 'row',
    gap: 15,
  },

  infoItem: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 10,
    color: '#DCEEFF',
    fontWeight: '600',
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },

  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },

  requiredText: {
    fontSize: 10,
    color: '#DC3545',
    fontWeight: '600',
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 15,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5DDE5',
    borderRadius: 12,
    backgroundColor: '#FAFCFE',
    minHeight: 50,
  },

  inputIconBox: {
    width: 43,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },

  inputIcon: {
    fontSize: 17,
  },

  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#222',
  },

  instructionsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  optionalHint: {
    fontSize: 10,
    color: '#8A94A6',
    marginTop: 15,
  },

  textAreaContainer: {
    alignItems: 'flex-start',
    minHeight: 120,
  },

  textAreaIconBox: {
    height: 118,
    paddingTop: 2,
  },

  textArea: {
    minHeight: 118,
    paddingTop: 13,
  },

  helperText: {
    fontSize: 10,
    color: '#8A94A6',
    lineHeight: 16,
    marginTop: 7,
  },

  saveButton: {
    backgroundColor: '#1769AA',
    minHeight: 51,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 24,
  },

  disabledButton: {
    backgroundColor: '#8AAFCB',
  },

  saveButtonIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 13,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E5EAF0',
  },

  noteIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  noteIcon: {
    fontSize: 15,
  },

  noteContent: {
    flex: 1,
  },

  noteTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 3,
  },

  noteText: {
    fontSize: 11,
    color: '#718096',
    lineHeight: 17,
  },
});