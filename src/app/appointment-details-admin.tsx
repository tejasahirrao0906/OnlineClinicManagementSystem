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

type Appointment = {
  patientId?: string;
  doctorName?: string;
  specialization?: string;
  date?: string;
  time?: string;
  reason?: string;
  status?: string;
  slotId?: string;
  createdAt?: any;
};

type Patient = {
  name?: string;
  email?: string;
  phone?: string;
};

export default function AdminAppointmentDetailsScreen() {
  const { appointmentId } =
    useLocalSearchParams<{
      appointmentId: string;
    }>();

  const [appointment, setAppointment] =
    useState<Appointment | null>(null);

  const [patient, setPatient] =
    useState<Patient | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadAppointmentDetails =
      async () => {
        if (!appointmentId) {
          Alert.alert(
            'Error',
            'Appointment information is missing.',
          );

          setLoading(false);
          return;
        }

        try {
          const appointmentRef = doc(
            db,
            'appointments',
            appointmentId,
          );

          const appointmentSnapshot =
            await getDoc(appointmentRef);

          if (
            !appointmentSnapshot.exists()
          ) {
            Alert.alert(
              'Appointment Not Found',
              'The selected appointment could not be found.',
            );

            setLoading(false);
            return;
          }

          const appointmentData =
            appointmentSnapshot.data() as Appointment;

          setAppointment(
            appointmentData,
          );

          if (
            appointmentData.patientId
          ) {
            const patientRef = doc(
              db,
              'users',
              appointmentData.patientId,
            );

            const patientSnapshot =
              await getDoc(patientRef);

            if (
              patientSnapshot.exists()
            ) {
              setPatient(
                patientSnapshot.data() as Patient,
              );
            }
          }
        } catch (error) {
          console.log(
            'Appointment details loading error:',
            error,
          );

          Alert.alert(
            'Error',
            'Unable to load appointment details.',
          );
        } finally {
          setLoading(false);
        }
      };

    loadAppointmentDetails();
  }, [appointmentId]);

  const getStatusColor = (
    status?: string,
  ) => {
    if (status === 'Completed') {
      return '#15803D';
    }

    if (status === 'Cancelled') {
      return '#D32F2F';
    }

    return '#1769AA';
  };

  const getStatusBackground = (
    status?: string,
  ) => {
    if (status === 'Completed') {
      return '#DCFCE7';
    }

    if (status === 'Cancelled') {
      return '#FEE2E2';
    }

    return '#E8F2FA';
  };

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <View
          style={
            styles.loadingCircle
          }
        >
          <ActivityIndicator
            size="large"
            color="#1769AA"
          />
        </View>

        <Text
          style={
            styles.loadingTitle
          }
        >
          Loading Appointment Details
        </Text>

        <Text
          style={
            styles.loadingText
          }
        >
          Please wait while the appointment
          record is being retrieved.
        </Text>
      </View>
    );
  }

  if (!appointment) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <View
          style={
            styles.errorIconCircle
          }
        >
          <Text
            style={
              styles.errorIcon
            }
          >
            !
          </Text>
        </View>

        <Text
          style={
            styles.errorTitle
          }
        >
          Appointment Unavailable
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          The requested appointment record
          could not be loaded.
        </Text>

        <TouchableOpacity
          style={
            styles.errorBackButton
          }
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

  const status =
    appointment.status || 'Booked';

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

          <View
            style={styles.headerSection}
          >
            <View
              style={
                styles.headerIconCircle
              }
            >
              <Text
                style={
                  styles.headerIcon
                }
              >
                📅
              </Text>
            </View>

            <Text
              style={styles.title}
            >
              Appointment Details
            </Text>

            <Text
              style={styles.subtitle}
            >
              Complete appointment information
            </Text>
          </View>
        </View>

        {/* Status */}
        <View
          style={styles.statusCard}
        >
          <Text
            style={
              styles.statusLabel
            }
          >
            APPOINTMENT STATUS
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  getStatusBackground(
                    status,
                  ),
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    getStatusColor(
                      status,
                    ),
                },
              ]}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color:
                    getStatusColor(
                      status,
                    ),
                },
              ]}
            >
              {status}
            </Text>
          </View>
        </View>

        {/* Appointment Information */}
        <View style={styles.card}>
          <View
            style={styles.cardHeader}
          >
            <View
              style={
                styles.cardIconCircle
              }
            >
              <Text
                style={styles.cardIcon}
              >
                📅
              </Text>
            </View>

            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Appointment Information
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Schedule and visit details
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View
              style={
                styles.infoIconCircle
              }
            >
              <Text
                style={styles.infoIcon}
              >
                📅
              </Text>
            </View>

            <View
              style={styles.infoContent}
            >
              <Text
                style={styles.label}
              >
                Date
              </Text>

              <Text
                style={styles.value}
              >
                {appointment.date ||
                  'Not available'}
              </Text>
            </View>
          </View>

          <View
            style={styles.separator}
          />

          <View style={styles.infoRow}>
            <View
              style={
                styles.infoIconCircle
              }
            >
              <Text
                style={styles.infoIcon}
              >
                🕐
              </Text>
            </View>

            <View
              style={styles.infoContent}
            >
              <Text
                style={styles.label}
              >
                Time
              </Text>

              <Text
                style={styles.value}
              >
                {appointment.time ||
                  'Not available'}
              </Text>
            </View>
          </View>

          <View
            style={styles.separator}
          />

          <View style={styles.infoRow}>
            <View
              style={
                styles.infoIconCircle
              }
            >
              <Text
                style={styles.infoIcon}
              >
                💬
              </Text>
            </View>

            <View
              style={styles.infoContent}
            >
              <Text
                style={styles.label}
              >
                Reason for Visit
              </Text>

              <Text
                style={styles.value}
              >
                {appointment.reason ||
                  'Not specified'}
              </Text>
            </View>
          </View>
        </View>

        {/* Patient Information */}
        <View style={styles.card}>
          <View
            style={styles.cardHeader}
          >
            <View
              style={
                styles.cardIconCircle
              }
            >
              <Text
                style={styles.cardIcon}
              >
                👤
              </Text>
            </View>

            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Patient Information
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Patient associated with this appointment
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View
              style={
                styles.infoIconCircle
              }
            >
              <Text
                style={styles.infoIcon}
              >
                👤
              </Text>
            </View>

            <View
              style={styles.infoContent}
            >
              <Text
                style={styles.label}
              >
                Patient Name
              </Text>

              <Text
                style={styles.value}
              >
                {patient?.name ||
                  'Unknown Patient'}
              </Text>
            </View>
          </View>

          <View
            style={styles.separator}
          />

          <View style={styles.infoRow}>
            <View
              style={
                styles.infoIconCircle
              }
            >
              <Text
                style={styles.infoIcon}
              >
                ✉
              </Text>
            </View>

            <View
              style={styles.infoContent}
            >
              <Text
                style={styles.label}
              >
                Email
              </Text>

              <Text
                style={styles.value}
              >
                {patient?.email ||
                  'Not available'}
              </Text>
            </View>
          </View>

          <View
            style={styles.separator}
          />

          <View style={styles.infoRow}>
            <View
              style={
                styles.infoIconCircle
              }
            >
              <Text
                style={styles.infoIcon}
              >
                ☎
              </Text>
            </View>

            <View
              style={styles.infoContent}
            >
              <Text
                style={styles.label}
              >
                Phone
              </Text>

              <Text
                style={styles.value}
              >
                {patient?.phone ||
                  'Not available'}
              </Text>
            </View>
          </View>
        </View>

        {/* Doctor Information */}
        <View style={styles.card}>
          <View
            style={styles.cardHeader}
          >
            <View
              style={
                styles.cardIconCircle
              }
            >
              <Text
                style={styles.cardIcon}
              >
                👨‍⚕️
              </Text>
            </View>

            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Doctor Information
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Doctor assigned to this appointment
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View
              style={
                styles.infoIconCircle
              }
            >
              <Text
                style={styles.infoIcon}
              >
                👨‍⚕️
              </Text>
            </View>

            <View
              style={styles.infoContent}
            >
              <Text
                style={styles.label}
              >
                Doctor
              </Text>

              <Text
                style={styles.value}
              >
                {appointment.doctorName ||
                  'Unknown Doctor'}
              </Text>
            </View>
          </View>

          <View
            style={styles.separator}
          />

          <View style={styles.infoRow}>
            <View
              style={
                styles.infoIconCircle
              }
            >
              <Text
                style={styles.infoIcon}
              >
                🩺
              </Text>
            </View>

            <View
              style={styles.infoContent}
            >
              <Text
                style={styles.label}
              >
                Specialization
              </Text>

              <Text
                style={styles.value}
              >
                {appointment.specialization ||
                  'General Physician'}
              </Text>
            </View>
          </View>
        </View>

        {/* System Information */}
        <View style={styles.card}>
          <View
            style={styles.cardHeader}
          >
            <View
              style={
                styles.cardIconCircle
              }
            >
              <Text
                style={styles.cardIcon}
              >
                ⚙️
              </Text>
            </View>

            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                System Information
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Internal appointment identifiers
              </Text>
            </View>
          </View>

          <View style={styles.systemRow}>
            <Text
              style={styles.systemLabel}
            >
              Appointment ID
            </Text>

            <Text
              style={styles.systemValue}
              selectable
            >
              {appointmentId}
            </Text>
          </View>

          <View
            style={styles.separator}
          />

          <View style={styles.systemRow}>
            <Text
              style={styles.systemLabel}
            >
              Patient ID
            </Text>

            <Text
              style={styles.systemValue}
              selectable
            >
              {appointment.patientId ||
                'Not available'}
            </Text>
          </View>

          <View
            style={styles.separator}
          />

          <View style={styles.systemRow}>
            <Text
              style={styles.systemLabel}
            >
              Slot ID
            </Text>

            <Text
              style={styles.systemValue}
              selectable
            >
              {appointment.slotId ||
                'Not available'}
            </Text>
          </View>
        </View>

        {/* Read-only Note */}
        <View style={styles.noteCard}>
          <View
            style={styles.noteIconCircle}
          >
            <Text
              style={styles.noteIcon}
            >
              🔒
            </Text>
          </View>

          <View
            style={styles.noteContent}
          >
            <Text
              style={styles.noteTitle}
            >
              Admin View
            </Text>

            <Text
              style={styles.noteText}
            >
              This screen provides a read-only view
              of appointment information.
            </Text>
          </View>
        </View>

        {/* Bottom Navigation */}
        <TouchableOpacity
          style={
            styles.dashboardButton
          }
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text
            style={
              styles.dashboardButtonText
            }
          >
            ← Back to Appointments
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
    marginBottom: 18,
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

  headerSection: {
    alignItems: 'center',
  },

  headerIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  headerIcon: {
    fontSize: 40,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#1769AA',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
    textAlign: 'center',
  },

  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
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

  statusLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 8,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
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
    marginBottom: 7,
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

  systemRow: {
    paddingVertical: 8,
  },

  systemLabel: {
    fontSize: 10,
    color: '#8A94A6',
    fontWeight: '700',
    marginBottom: 4,
  },

  systemValue: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 16,
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