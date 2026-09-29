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

import { router } from 'expo-router';

import {
  collection,
  onSnapshot,
} from 'firebase/firestore';

import { db } from '../firebaseConfig';

type Patient = {
  id: string;
  name: string;
  email: string;
};

export default function ManagePatientsScreen() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const patientList: Patient[] =
          snapshot.docs.map((item) => {
            const data = item.data();

            return {
              id: item.id,
              name:
                data.name ||
                'Unknown Patient',
              email:
                data.email ||
                'No email available',
            };
          });

        setPatients(patientList);
        setLoading(false);
      },
      (error) => {
        console.log(
          'Patients loading error:',
          error,
        );

        setLoading(false);

        Alert.alert(
          'Error',
          'Unable to load patients. Please try again.',
        );
      },
    );

    return unsubscribe;
  }, []);

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

          <View style={styles.headerRow}>
            <View style={styles.headerIconCircle}>
              <Text style={styles.headerIcon}>
                👥
              </Text>
            </View>

            <View style={styles.headerContent}>
              <Text style={styles.title}>
                Manage Patients
              </Text>

              <Text style={styles.subtitle}>
                View registered patient records
              </Text>
            </View>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconCircle}>
            <Text style={styles.summaryIcon}>
              👤
            </Text>
          </View>

          <View style={styles.summaryContent}>
            <Text style={styles.summaryNumber}>
              {patients.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Registered Patients
            </Text>
          </View>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />

            <Text style={styles.liveText}>
              LIVE
            </Text>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Patient Directory
            </Text>

            <Text style={styles.sectionSubtitle}>
              {patients.length === 0
                ? 'No patients available'
                : 'View patient records and details'}
            </Text>
          </View>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.stateCard}>
            <View style={styles.loadingCircle}>
              <ActivityIndicator
                size="large"
                color="#1769AA"
              />
            </View>

            <Text style={styles.stateTitle}>
              Loading Patients
            </Text>

            <Text
              style={styles.stateDescription}
            >
              Please wait while patient records
              are loaded.
            </Text>
          </View>
        ) : patients.length === 0 ? (
          /* Empty State */
          <View style={styles.stateCard}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>
                👤
              </Text>
            </View>

            <Text style={styles.stateTitle}>
              No Patients Found
            </Text>

            <Text
              style={styles.stateDescription}
            >
              There are currently no patients
              registered in the system.
            </Text>
          </View>
        ) : (
          /* Patient List */
          <View>
            {patients.map((patient) => (
              <View
                key={patient.id}
                style={styles.patientCard}
              >
                {/* Patient Header */}
                <View
                  style={styles.patientHeader}
                >
                  <View
                    style={
                      styles.patientIconCircle
                    }
                  >
                    <Text
                      style={styles.patientIcon}
                    >
                      👤
                    </Text>
                  </View>

                  <View
                    style={styles.patientInfo}
                  >
                    <Text
                      style={styles.patientName}
                      numberOfLines={1}
                    >
                      {patient.name}
                    </Text>

                    <Text
                      style={
                        styles.patientEmail
                      }
                      numberOfLines={1}
                    >
                      {patient.email}
                    </Text>
                  </View>

                  <View style={styles.activeBadge}>
                    <View
                      style={styles.activeDot}
                    />

                    <Text
                      style={styles.activeText}
                    >
                      Active
                    </Text>
                  </View>
                </View>

                {/* Patient ID */}
                <View style={styles.idContainer}>
                  <Text style={styles.idLabel}>
                    Patient ID
                  </Text>

                  <Text
                    style={styles.patientId}
                    numberOfLines={1}
                  >
                    {patient.id}
                  </Text>
                </View>

                {/* View Button */}
                <View
                  style={styles.actionDivider}
                />

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() =>
                    router.push({
                      pathname:
                        '/patient-details',
                      params: {
                        patientId:
                          patient.id,
                      },
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Text
                    style={styles.viewIcon}
                  >
                    👁
                  </Text>

                  <Text
                    style={
                      styles.viewButtonText
                    }
                  >
                    View Patient Details
                  </Text>

                  <Text
                    style={styles.viewArrow}
                  >
                    ›
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Bottom Back Button */}
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
            ← Back to Admin Dashboard
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

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  headerIcon: {
    fontSize: 27,
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1769AA',
  },

  subtitle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
    lineHeight: 18,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  summaryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  summaryIcon: {
    fontSize: 24,
  },

  summaryContent: {
    flex: 1,
  },

  summaryNumber: {
    fontSize: 23,
    fontWeight: '800',
    color: '#1769AA',
  },

  summaryLabel: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 5,
  },

  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1F2937',
  },

  sectionSubtitle: {
    fontSize: 11,
    color: '#8A94A6',
    marginTop: 3,
  },

  stateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 25,
    paddingVertical: 30,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  loadingCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  emptyIconCircle: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  emptyIcon: {
    fontSize: 32,
  },

  stateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },

  stateDescription: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 7,
  },

  patientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 13,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  patientIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  patientIcon: {
    fontSize: 27,
  },

  patientInfo: {
    flex: 1,
    marginRight: 8,
  },

  patientName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },

  patientEmail: {
    fontSize: 11,
    color: '#1769AA',
    marginTop: 4,
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 5,
  },

  activeText: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '800',
  },

  idContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 13,
  },

  idLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },

  patientId: {
    fontSize: 10,
    color: '#64748B',
  },

  actionDivider: {
    height: 1,
    backgroundColor: '#EEF2F6',
    marginVertical: 13,
  },

  viewButton: {
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: '#E8F2FA',
    borderWidth: 1,
    borderColor: '#1769AA',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
  },

  viewIcon: {
    fontSize: 14,
    marginRight: 7,
  },

  viewButtonText: {
    flex: 1,
    color: '#1769AA',
    fontSize: 12,
    fontWeight: '800',
  },

  viewArrow: {
    fontSize: 23,
    color: '#1769AA',
    marginLeft: 5,
  },

  dashboardButton: {
    backgroundColor: '#64748B',
    minHeight: 47,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },

  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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