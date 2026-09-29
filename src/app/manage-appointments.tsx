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
  doc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';

import { db } from '../firebaseConfig';

type Appointment = {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  reason: string;
  status: string;
};

export default function ManageAppointmentsScreen() {
  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'appointments'),
      async (snapshot) => {
        try {
          const appointmentList: Appointment[] =
            await Promise.all(
              snapshot.docs.map(
                async (item) => {
                  const data = item.data();

                  let patientName =
                    'Unknown Patient';

                  if (data.patientId) {
                    try {
                      const patientRef =
                        doc(
                          db,
                          'users',
                          data.patientId,
                        );

                      const patientSnapshot =
                        await getDoc(
                          patientRef,
                        );

                      if (
                        patientSnapshot.exists()
                      ) {
                        const patientData =
                          patientSnapshot.data();

                        patientName =
                          patientData.name ||
                          'Unknown Patient';
                      }
                    } catch (error) {
                      console.log(
                        'Patient name loading error:',
                        error,
                      );
                    }
                  }

                  return {
                    id: item.id,
                    patientId:
                      data.patientId || '',
                    patientName,
                    doctorName:
                      data.doctorName ||
                      'Unknown Doctor',
                    specialization:
                      data.specialization ||
                      'General Physician',
                    date:
                      data.date ||
                      'Not available',
                    time:
                      data.time ||
                      'Not available',
                    reason:
                      data.reason ||
                      'Not specified',
                    status:
                      data.status || 'Booked',
                  };
                },
              ),
            );

          setAppointments(
            appointmentList,
          );

          setLoading(false);
        } catch (error) {
          console.log(
            'Appointments processing error:',
            error,
          );

          setLoading(false);

          Alert.alert(
            'Error',
            'Unable to process appointments.',
          );
        }
      },
      (error) => {
        console.log(
          'Appointments loading error:',
          error,
        );

        setLoading(false);

        Alert.alert(
          'Error',
          'Unable to load appointments.',
        );
      },
    );

    return unsubscribe;
  }, []);

  const getStatusColor = (
    status: string,
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
    status: string,
  ) => {
    if (status === 'Completed') {
      return '#DCFCE7';
    }

    if (status === 'Cancelled') {
      return '#FEE2E2';
    }

    return '#E8F2FA';
  };

  const confirmedCount =
    appointments.filter(
      (appointment) =>
        appointment.status === 'Confirmed',
    ).length;

  const completedCount =
    appointments.filter(
      (appointment) =>
        appointment.status === 'Completed',
    ).length;

  const cancelledCount =
    appointments.filter(
      (appointment) =>
        appointment.status === 'Cancelled',
    ).length;

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
            <View
              style={
                styles.headerIconCircle
              }
            >
              <Text style={styles.headerIcon}>
                📅
              </Text>
            </View>

            <View
              style={styles.headerContent}
            >
              <Text style={styles.title}>
                Manage Appointments
              </Text>

              <Text style={styles.subtitle}>
                View and monitor clinic appointments
              </Text>
            </View>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View
            style={styles.summaryIconCircle}
          >
            <Text style={styles.summaryIcon}>
              📅
            </Text>
          </View>

          <View style={styles.summaryContent}>
            <Text style={styles.summaryNumber}>
              {appointments.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Total Appointments
            </Text>
          </View>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />

            <Text style={styles.liveText}>
              LIVE
            </Text>
          </View>
        </View>

        {/* Status Summary */}
        {!loading &&
          appointments.length > 0 && (
            <View style={styles.statusSummary}>
              <View style={styles.statusSummaryCard}>
                <Text
                  style={
                    styles.statusSummaryNumber
                  }
                >
                  {confirmedCount}
                </Text>

                <Text
                  style={
                    styles.statusSummaryLabel
                  }
                >
                  Confirmed
                </Text>
              </View>

              <View style={styles.statusSummaryCard}>
                <Text
                  style={
                    styles.statusSummaryNumber
                  }
                >
                  {completedCount}
                </Text>

                <Text
                  style={
                    styles.statusSummaryLabel
                  }
                >
                  Completed
                </Text>
              </View>

              <View style={styles.statusSummaryCard}>
                <Text
                  style={
                    styles.statusSummaryNumber
                  }
                >
                  {cancelledCount}
                </Text>

                <Text
                  style={
                    styles.statusSummaryLabel
                  }
                >
                  Cancelled
                </Text>
              </View>
            </View>
          )}

        {/* Section Header */}
        <View
          style={styles.sectionHeader}
        >
          <Text style={styles.sectionTitle}>
            Appointment Directory
          </Text>

          <Text
            style={styles.sectionSubtitle}
          >
            {appointments.length === 0
              ? 'No appointments available'
              : 'View appointment details and status'}
          </Text>
        </View>

        {/* Loading */}
        {loading ? (
          <View style={styles.stateCard}>
            <View style={styles.loadingCircle}>
              <ActivityIndicator
                size="large"
                color="#1769AA"
              />
            </View>

            <Text style={styles.stateTitle}>
              Loading Appointments
            </Text>

            <Text
              style={styles.stateDescription}
            >
              Please wait while appointment
              records are loaded.
            </Text>
          </View>
        ) : appointments.length === 0 ? (
          /* Empty State */
          <View style={styles.stateCard}>
            <View
              style={styles.emptyIconCircle}
            >
              <Text style={styles.emptyIcon}>
                📅
              </Text>
            </View>

            <Text style={styles.stateTitle}>
              No Appointments Found
            </Text>

            <Text
              style={styles.stateDescription}
            >
              There are currently no appointments
              registered in the system.
            </Text>
          </View>
        ) : (
          /* Appointment List */
          <View>
            {appointments.map(
              (appointment) => (
                <View
                  key={appointment.id}
                  style={styles.appointmentCard}
                >
                  {/* Appointment Header */}
                  <View
                    style={
                      styles.cardHeader
                    }
                  >
                    <View
                      style={
                        styles.dateContainer
                      }
                    >
                      <View
                        style={
                          styles.dateIconCircle
                        }
                      >
                        <Text
                          style={
                            styles.dateIcon
                          }
                        >
                          📅
                        </Text>
                      </View>

                      <View
                        style={
                          styles.dateContent
                        }
                      >
                        <Text
                          style={
                            styles.dateText
                          }
                        >
                          {appointment.date}
                        </Text>

                        <Text
                          style={
                            styles.timeText
                          }
                        >
                          {appointment.time}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            getStatusBackground(
                              appointment.status,
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
                                appointment.status,
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
                                appointment.status,
                              ),
                          },
                        ]}
                      >
                        {appointment.status}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={styles.separator}
                  />

                  {/* Patient */}
                  <View
                    style={styles.detailBlock}
                  >
                    <Text
                      style={styles.sectionLabel}
                    >
                      PATIENT
                    </Text>

                    <View
                      style={
                        styles.personRow
                      }
                    >
                      <View
                        style={
                          styles.personIconCircle
                        }
                      >
                        <Text
                          style={
                            styles.personIcon
                          }
                        >
                          👤
                        </Text>
                      </View>

                      <View
                        style={
                          styles.personContent
                        }
                      >
                        <Text
                          style={
                            styles.patientName
                          }
                        >
                          {
                            appointment.patientName
                          }
                        </Text>

                        <Text
                          style={
                            styles.smallId
                          }
                        >
                          Patient record
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Doctor */}
                  <View
                    style={styles.detailBlock}
                  >
                    <Text
                      style={styles.sectionLabel}
                    >
                      DOCTOR
                    </Text>

                    <View
                      style={
                        styles.personRow
                      }
                    >
                      <View
                        style={[
                          styles.personIconCircle,
                          styles.doctorIconCircle,
                        ]}
                      >
                        <Text
                          style={
                            styles.personIcon
                          }
                        >
                          👨‍⚕️
                        </Text>
                      </View>

                      <View
                        style={
                          styles.personContent
                        }
                      >
                        <Text
                          style={
                            styles.doctorName
                          }
                        >
                          {
                            appointment.doctorName
                          }
                        </Text>

                        <Text
                          style={
                            styles.specialization
                          }
                        >
                          {
                            appointment.specialization
                          }
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Reason */}
                  <View
                    style={styles.reasonBox}
                  >
                    <Text
                      style={styles.sectionLabel}
                    >
                      REASON FOR VISIT
                    </Text>

                    <Text
                      style={styles.reason}
                    >
                      {appointment.reason}
                    </Text>
                  </View>

                  {/* Appointment ID */}
                  <View
                    style={styles.idContainer}
                  >
                    <Text
                      style={styles.idLabel}
                    >
                      Appointment ID
                    </Text>

                    <Text
                      style={styles.appointmentId}
                      numberOfLines={1}
                    >
                      {appointment.id}
                    </Text>
                  </View>

                  {/* View Details */}
                  <TouchableOpacity
                    style={
                      styles.viewButton
                    }
                    onPress={() =>
                      router.push({
                        pathname:
                          '/appointment-details-admin',
                        params: {
                          appointmentId:
                            appointment.id,
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
                      View Appointment Details
                    </Text>

                    <Text
                      style={styles.viewArrow}
                    >
                      ›
                    </Text>
                  </TouchableOpacity>
                </View>
              ),
            )}
          </View>
        )}

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
            ← Back to Admin Dashboard
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

  summaryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FFF7ED',
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

  statusSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  statusSummaryCard: {
    width: '31.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  statusSummaryNumber: {
    fontSize: 21,
    fontWeight: '800',
    color: '#1769AA',
  },

  statusSummaryLabel: {
    fontSize: 10,
    color: '#718096',
    marginTop: 2,
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
    backgroundColor: '#FFF7ED',
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

  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
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
    justifyContent: 'space-between',
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },

  dateIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  dateIcon: {
    fontSize: 22,
  },

  dateContent: {
    flex: 1,
  },

  dateText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },

  timeText: {
    fontSize: 12,
    color: '#718096',
    marginTop: 3,
    fontWeight: '600',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 20,
    marginLeft: 5,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },

  separator: {
    height: 1,
    backgroundColor: '#EEF2F6',
    marginVertical: 14,
  },

  detailBlock: {
    marginBottom: 12,
  },

  sectionLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  personIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  doctorIconCircle: {
    backgroundColor: '#E8F2FA',
  },

  personIcon: {
    fontSize: 18,
  },

  personContent: {
    flex: 1,
  },

  patientName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
  },

  smallId: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },

  doctorName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1769AA',
  },

  specialization: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },

  reasonBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 11,
    padding: 11,
    marginTop: 2,
    marginBottom: 12,
  },

  reason: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
  },

  idContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  idLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  appointmentId: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
  },

  viewButton: {
    minHeight: 43,
    borderRadius: 10,
    backgroundColor: '#E8F2FA',
    borderWidth: 1,
    borderColor: '#1769AA',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginTop: 13,
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