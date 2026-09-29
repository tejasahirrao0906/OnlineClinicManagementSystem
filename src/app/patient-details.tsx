import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import { db } from '../firebaseConfig';

type Patient = {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
};

export default function PatientDetailsScreen() {
  const { patientId } =
    useLocalSearchParams<{
      patientId: string;
    }>();

  const [patient, setPatient] =
    useState<Patient | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadPatient = async () => {
      if (!patientId) {
        Alert.alert(
          'Error',
          'Patient information is missing.',
        );

        setLoading(false);
        return;
      }

      try {
        const patientRef = doc(
          db,
          'users',
          patientId,
        );

        const patientSnapshot =
          await getDoc(patientRef);

        if (!patientSnapshot.exists()) {
          Alert.alert(
            'Patient Not Found',
            'The selected patient could not be found.',
          );

          setLoading(false);
          return;
        }

        setPatient(
          patientSnapshot.data() as Patient,
        );
      } catch (error) {
        console.log(
          'Patient details loading error:',
          error,
        );

        Alert.alert(
          'Error',
          'Unable to load patient details.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [patientId]);

  if (loading) {
    return (
      <View
        style={styles.loadingContainer}
      >
        <View style={styles.loadingCircle}>
          <ActivityIndicator
            size="large"
            color="#1769AA"
          />
        </View>

        <Text style={styles.loadingTitle}>
          Loading Patient Details
        </Text>

        <Text style={styles.loadingText}>
          Please wait while the patient record
          is being retrieved.
        </Text>
      </View>
    );
  }

  if (!patient) {
    return (
      <View
        style={styles.loadingContainer}
      >
        <View style={styles.errorIconCircle}>
          <Text style={styles.errorIcon}>
            !
          </Text>
        </View>

        <Text style={styles.errorTitle}>
          Patient Details Unavailable
        </Text>

        <Text style={styles.errorText}>
          The requested patient record could not
          be loaded.
        </Text>

        <TouchableOpacity
          style={styles.errorBackButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text
            style={
              styles.errorBackButtonText
            }
          >
            ← Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
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

          <View style={styles.profileSection}>
            <View
              style={
                styles.profileIconCircle
              }
            >
              <Text
                style={styles.profileIcon}
              >
                👤
              </Text>
            </View>

            <Text style={styles.title}>
              Patient Details
            </Text>

            <Text style={styles.subtitle}>
              Patient information and profile
            </Text>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />

              <Text style={styles.statusText}>
                Registered Patient
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View
              style={styles.cardIconCircle}
            >
              <Text style={styles.cardIcon}>
                👤
              </Text>
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Personal Information
              </Text>

              <Text style={styles.sectionSubtitle}>
                Basic patient details
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIcon}>
                👤
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>
                Full Name
              </Text>

              <Text style={styles.value}>
                {patient.name ||
                  'Not available'}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIcon}>
                ✉
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>
                Email Address
              </Text>

              <Text
                style={styles.value}
                numberOfLines={2}
              >
                {patient.email ||
                  'Not available'}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIcon}>
                ☎
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>
                Phone Number
              </Text>

              <Text style={styles.value}>
                {patient.phone ||
                  'Not available'}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIcon}>
                ⚥
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>
                Gender
              </Text>

              <Text style={styles.value}>
                {patient.gender ||
                  'Not available'}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIcon}>
                📅
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>
                Date of Birth
              </Text>

              <Text style={styles.value}>
                {patient.dateOfBirth ||
                  'Not available'}
              </Text>
            </View>
          </View>
        </View>

        {/* Patient ID */}
        <View style={styles.idCard}>
          <View style={styles.idIconCircle}>
            <Text style={styles.idIcon}>
              🆔
            </Text>
          </View>

          <View style={styles.idContent}>
            <Text style={styles.idLabel}>
              Patient ID
            </Text>

            <Text
              style={styles.idValue}
              selectable
            >
              {patientId ||
                'Unavailable'}
            </Text>
          </View>
        </View>

        {/* Information Note */}
        <View style={styles.noteCard}>
          <View style={styles.noteIconCircle}>
            <Text style={styles.noteIcon}>
              🔒
            </Text>
          </View>

          <View style={styles.noteContent}>
            <Text style={styles.noteTitle}>
              Patient Record
            </Text>

            <Text style={styles.noteText}>
              This screen provides a read-only view
              of the patient's registered information.
            </Text>
          </View>
        </View>

        {/* Bottom Navigation */}
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text
            style={
              styles.dashboardButtonText
            }
          >
            ← Back to Patients
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
    </View>
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

  profileSection: {
    alignItems: 'center',
  },

  profileIconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  profileIcon: {
    fontSize: 42,
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
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 5,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  cardIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  cardIcon: {
    fontSize: 19,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
  },

  sectionSubtitle: {
    fontSize: 10,
    color: '#8A94A6',
    marginTop: 2,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },

  infoIconCircle: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: '#F5F9FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  infoIcon: {
    fontSize: 15,
  },

  infoContent: {
    flex: 1,
  },

  label: {
    fontSize: 10,
    color: '#8A94A6',
    fontWeight: '700',
    marginBottom: 3,
  },

  value: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '700',
    lineHeight: 20,
  },

  separator: {
    height: 1,
    backgroundColor: '#EEF2F6',
  },

  idCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5EAF0',
  },

  idIconCircle: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  idIcon: {
    fontSize: 19,
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
    lineHeight: 16,
    marginTop: 3,
  },

  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5EAF0',
    marginBottom: 14,
  },

  noteIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  noteIcon: {
    fontSize: 18,
  },

  noteContent: {
    flex: 1,
  },

  noteTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
  },

  noteText: {
    fontSize: 10,
    color: '#8A94A6',
    lineHeight: 15,
    marginTop: 2,
  },

  dashboardButton: {
    backgroundColor: '#64748B',
    minHeight: 47,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dashboardButtonText: {
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

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F9FC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  loadingCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  loadingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },

  loadingText: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },

  errorIconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  errorIcon: {
    fontSize: 28,
    fontWeight: '800',
    color: '#D32F2F',
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },

  errorText: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 18,
  },

  errorBackButton: {
    backgroundColor: '#64748B',
    minHeight: 45,
    paddingHorizontal: 28,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorBackButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});