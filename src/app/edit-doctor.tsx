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
  doc,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../firebaseConfig';

export default function EditDoctorScreen() {
  const {
    doctorId,
    doctorName,
    specialization,
  } = useLocalSearchParams<{
    doctorId: string;
    doctorName: string;
    specialization: string;
  }>();

  const [name, setName] = useState(
    doctorName || '',
  );

  const [
    doctorSpecialization,
    setDoctorSpecialization,
  ] = useState(specialization || '');

  const [loading, setLoading] =
    useState(false);

  const handleUpdateDoctor = async () => {
    const cleanName = name.trim();
    const cleanSpecialization =
      doctorSpecialization.trim();

    if (
      !cleanName ||
      !cleanSpecialization
    ) {
      Alert.alert(
        'Missing Details',
        'Please enter doctor name and specialization.',
      );
      return;
    }

    if (!doctorId) {
      Alert.alert(
        'Error',
        'Doctor information is missing.',
      );
      return;
    }

    try {
      setLoading(true);

      const doctorRef = doc(
        db,
        'doctors',
        doctorId,
      );

      await updateDoc(doctorRef, {
        name: cleanName,
        specialization:
          cleanSpecialization,
      });

      Alert.alert(
        'Doctor Updated',
        `${cleanName}'s details have been updated successfully.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.log(
        'Update doctor error:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to update doctor. Please try again.',
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
            disabled={loading}
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
            <View
              style={styles.headerIconCircle}
            >
              <Text style={styles.headerIcon}>
                ✎
              </Text>
            </View>

            <View style={styles.headerContent}>
              <Text style={styles.title}>
                Edit Doctor
              </Text>

              <Text style={styles.subtitle}>
                Update the doctor's information
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
              Doctor Profile
            </Text>

            <Text style={styles.infoText}>
              Update the doctor's name or
              specialization. The doctor's registered
              email and account information will remain
              unchanged.
            </Text>
          </View>
        </View>

        {/* Doctor ID */}
        <View style={styles.idCard}>
          <View style={styles.idIconCircle}>
            <Text style={styles.idIcon}>
              🆔
            </Text>
          </View>

          <View style={styles.idContent}>
            <Text style={styles.idLabel}>
              Doctor ID
            </Text>

            <Text
              style={styles.idValue}
              numberOfLines={1}
            >
              {doctorId || 'Unavailable'}
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            Doctor Information
          </Text>

          <Text style={styles.formSubtitle}>
            Update the details below
          </Text>

          {/* Name */}
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
              value={doctorSpecialization}
              onChangeText={
                setDoctorSpecialization
              }
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          {/* Update */}
          <TouchableOpacity
            style={[
              styles.updateButton,
              loading &&
                styles.updateButtonDisabled,
            ]}
            onPress={handleUpdateDoctor}
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
                  style={styles.updateButtonText}
                >
                  Updating...
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={styles.updateButtonIcon}
                >
                  ✓
                </Text>

                <Text
                  style={styles.updateButtonText}
                >
                  Update Doctor
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Security Note */}
        <View style={styles.securityCard}>
          <View
            style={styles.securityIconCircle}
          >
            <Text style={styles.securityIcon}>
              🔒
            </Text>
          </View>

          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>
              Admin Controlled
            </Text>

            <Text style={styles.securityText}>
              Doctor profile changes can only be
              performed by an authorized administrator.
            </Text>
          </View>
        </View>

        {/* Cancel */}
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
    color: '#1769AA',
    fontSize: 14,
    fontWeight: '700',
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
    fontSize: 25,
    color: '#1769AA',
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
    marginBottom: 14,
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

  idCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5EAF0',
  },

  idIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  idIcon: {
    fontSize: 18,
  },

  idContent: {
    flex: 1,
  },

  idLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  idValue: {
    fontSize: 10,
    color: '#64748B',
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

  updateButton: {
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

  updateButtonDisabled: {
    opacity: 0.7,
  },

  updateButtonIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
  },

  updateButtonText: {
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