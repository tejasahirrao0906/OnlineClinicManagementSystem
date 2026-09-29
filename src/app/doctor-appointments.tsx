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
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

import { auth, db } from '../firebaseConfig';

type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  reason: string;
  status: string;
};

export default function DoctorAppointmentsScreen() {
  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [loading, setLoading] = useState(true);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  useEffect(() => {
    let unsubscribeAppointments: (() => void) | null = null;

    const loadDoctorAppointments = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          Alert.alert(
            'Login Required',
            'Please login as a doctor first.',
          );

          router.replace('/doctor-login');
          return;
        }

        // Find doctor profile using Firebase Auth UID
        const doctorsQuery = query(
          collection(db, 'doctors'),
          where('uid', '==', user.uid),
        );

        const doctorsSnapshot =
          await getDocs(doctorsQuery);

        if (doctorsSnapshot.empty) {
          Alert.alert(
            'Doctor Profile Not Found',
            'Your account is not linked to a doctor profile.',
          );

          await auth.signOut();

          router.replace('/doctor-login');
          return;
        }

        // Get the doctor Firestore document
        const doctorDocument =
          doctorsSnapshot.docs[0];

        const doctorId =
          doctorDocument.id;

        // Load appointments for this doctor
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('doctorId', '==', doctorId),
        );

        unsubscribeAppointments =
          onSnapshot(
            appointmentsQuery,
            (snapshot) => {
              const appointmentList: Appointment[] =
                snapshot.docs.map(
                  (appointmentDoc) => {
                    const data =
                      appointmentDoc.data();

                    return {
                      id: appointmentDoc.id,
                      patientId:
                        data.patientId || '',
                      doctorId:
                        data.doctorId || '',
                      doctorName:
                        data.doctorName || '',
                      date:
                        data.date || '',
                      time:
                        data.time || '',
                      reason:
                        data.reason || '',
                      status:
                        data.status || 'Booked',
                    };
                  },
                );

              setAppointments(
                appointmentList,
              );

              setLoading(false);
            },
            (error) => {
              console.log(
                'Error loading doctor appointments:',
                error,
              );

              setLoading(false);

              Alert.alert(
                'Error',
                'Unable to load appointments.',
              );
            },
          );
      } catch (error) {
        console.log(
          'Doctor appointment loading error:',
          error,
        );

        setLoading(false);

        Alert.alert(
          'Error',
          'Unable to load doctor information.',
        );
      }
    };

    loadDoctorAppointments();

    return () => {
      if (unsubscribeAppointments) {
        unsubscribeAppointments();
      }
    };
  }, []);

  const updateAppointmentStatus = async (
    appointmentId: string,
    newStatus: string,
  ) => {
    try {
      setUpdatingId(appointmentId);

      const appointmentRef = doc(
        db,
        'appointments',
        appointmentId,
      );

      await updateDoc(
        appointmentRef,
        {
          status: newStatus,
        },
      );

      Alert.alert(
        'Success',
        `Appointment marked as ${newStatus}.`,
      );
    } catch (error) {
      console.log(
        'Status update error:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to update appointment status.',
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmStatusUpdate = (
    appointmentId: string,
    newStatus: string,
  ) => {
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to mark this appointment as ${newStatus}?`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () =>
            updateAppointmentStatus(
              appointmentId,
              newStatus,
            ),
        },
      ],
    );
  };

  const totalAppointments =
    appointments.length;

  const completedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === 'Completed',
    ).length;

  const pendingAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === 'Confirmed' ||
        appointment.status === 'Booked',
    ).length;

  const cancelledAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === 'Cancelled',
    ).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            ‹
          </Text>
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>
            Appointments
          </Text>

          <Text style={styles.subtitle}>
            Manage your patient appointments
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <View style={styles.loadingCircle}>
            <ActivityIndicator
              size="large"
              color="#1769AA"
            />
          </View>

          <Text style={styles.loadingTitle}>
            Loading appointments
          </Text>

          <Text style={styles.loadingText}>
            Please wait while we fetch your appointments.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.summaryTitle}>
                  Appointment Overview
                </Text>

                <Text style={styles.summarySubtitle}>
                  Your current appointment activity
                </Text>
              </View>

              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />

                <Text style={styles.liveText}>
                  LIVE
                </Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>
                  {totalAppointments}
                </Text>

                <Text style={styles.summaryLabel}>
                  Total
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>
                  {pendingAppointments}
                </Text>

                <Text style={styles.summaryLabel}>
                  Pending
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>
                  {completedAppointments}
                </Text>

                <Text style={styles.summaryLabel}>
                  Completed
                </Text>
              </View>
            </View>
          </View>

          {/* Cancelled information */}
          {cancelledAppointments > 0 && (
            <View style={styles.cancelledInfo}>
              <Text style={styles.cancelledInfoIcon}>
                ⓘ
              </Text>

              <Text style={styles.cancelledInfoText}>
                {cancelledAppointments}{' '}
                cancelled appointment
                {cancelledAppointments !== 1
                  ? 's'
                  : ''}{' '}
                in your appointment history.
              </Text>
            </View>
          )}

          {/* Empty State */}
          {appointments.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyIcon}>
                  📅
                </Text>
              </View>

              <Text style={styles.emptyTitle}>
                No Appointments Yet
              </Text>

              <Text style={styles.emptyText}>
                You currently don't have any
                patient appointments.
              </Text>

              <View style={styles.emptyHint}>
                <Text style={styles.emptyHintText}>
                  New appointments will appear here
                  automatically.
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* Section Header */}
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    Patient Appointments
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    {appointments.length}{' '}
                    appointment
                    {appointments.length !== 1
                      ? 's'
                      : ''}{' '}
                    found
                  </Text>
                </View>
              </View>

              {/* Appointment List */}
              {appointments.map(
                (appointment) => {
                  const isUpdating =
                    updatingId ===
                    appointment.id;

                  const isCompleted =
                    appointment.status ===
                    'Completed';

                  const isCancelled =
                    appointment.status ===
                    'Cancelled';

                  return (
                    <View
                      key={appointment.id}
                      style={styles.appointmentCard}
                    >
                      {/* Card Header */}
                      <View
                        style={styles.cardHeader}
                      >
                        <View
                          style={
                            styles.patientSection
                          }
                        >
                          <View
                            style={
                              styles.patientIconCircle
                            }
                          >
                            <Text
                              style={
                                styles.patientIcon
                              }
                            >
                              👤
                            </Text>
                          </View>

                          <View>
                            <Text
                              style={
                                styles.patientTitle
                              }
                            >
                              Patient
                            </Text>

                            <Text
                              style={
                                styles.patientSubtitle
                              }
                            >
                              Appointment details
                            </Text>
                          </View>
                        </View>

                        <View
                          style={[
                            styles.statusBadge,
                            isCompleted
                              ? styles.completedBadge
                              : isCancelled
                              ? styles.cancelledBadge
                              : styles.bookedBadge,
                          ]}
                        >
                          <Text
                            style={
                              styles.statusText
                            }
                          >
                            {appointment.status}
                          </Text>
                        </View>
                      </View>

                      {/* Appointment Information */}
                      <View
                        style={
                          styles.detailsContainer
                        }
                      >
                        <View
                          style={
                            styles.detailRow
                          }
                        >
                          <View
                            style={
                              styles.detailIconBox
                            }
                          >
                            <Text
                              style={
                                styles.detailIcon
                              }
                            >
                              📅
                            </Text>
                          </View>

                          <View
                            style={
                              styles.detailContent
                            }
                          >
                            <Text
                              style={
                                styles.detailLabel
                              }
                            >
                              Date
                            </Text>

                            <Text
                              style={
                                styles.detailValue
                              }
                            >
                              {appointment.date}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={
                            styles.detailRow
                          }
                        >
                          <View
                            style={
                              styles.detailIconBox
                            }
                          >
                            <Text
                              style={
                                styles.detailIcon
                              }
                            >
                              ⏰
                            </Text>
                          </View>

                          <View
                            style={
                              styles.detailContent
                            }
                          >
                            <Text
                              style={
                                styles.detailLabel
                              }
                            >
                              Time
                            </Text>

                            <Text
                              style={
                                styles.detailValue
                              }
                            >
                              {appointment.time}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={
                            styles.detailRow
                          }
                        >
                          <View
                            style={
                              styles.detailIconBox
                            }
                          >
                            <Text
                              style={
                                styles.detailIcon
                              }
                            >
                              🩺
                            </Text>
                          </View>

                          <View
                            style={
                                styles.detailContent
                            }
                          >
                            <Text
                              style={
                                styles.detailLabel
                              }
                            >
                              Reason for Visit
                            </Text>

                            <Text
                              style={
                                styles.detailValue
                              }
                            >
                              {appointment.reason ||
                                'Not specified'}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Patient ID */}
                      <View
                        style={
                          styles.patientIdContainer
                        }
                      >
                        <Text
                          style={
                            styles.patientIdLabel
                          }
                        >
                          Patient ID
                        </Text>

                        <Text
                          style={
                            styles.patientId
                          }
                          numberOfLines={1}
                        >
                          {appointment.patientId}
                        </Text>
                      </View>

                      {/* Updating State */}
                      {isUpdating && (
                        <View
                          style={
                            styles.updatingContainer
                          }
                        >
                          <ActivityIndicator
                            size="small"
                            color="#1769AA"
                          />

                          <Text
                            style={
                              styles.updatingText
                            }
                          >
                            Updating appointment...
                          </Text>
                        </View>
                      )}

                      {/* Appointment Actions */}
                      {!isCompleted &&
                        !isCancelled && (
                          <View
                            style={styles.actionsSection}
                          >
                            <Text
                              style={
                                styles.actionsTitle
                              }
                            >
                              Appointment Actions
                            </Text>

                            <View
                              style={
                                styles.actions
                              }
                            >
                              <TouchableOpacity
                                style={[
                                  styles.completeButton,
                                  isUpdating &&
                                    styles.disabledButton,
                                ]}
                                disabled={
                                  isUpdating
                                }
                                onPress={() =>
                                  confirmStatusUpdate(
                                    appointment.id,
                                    'Completed',
                                  )
                                }
                              >
                                {isUpdating ? (
                                  <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                  />
                                ) : (
                                  <Text
                                    style={
                                      styles.actionText
                                    }
                                  >
                                    ✓ Complete
                                  </Text>
                                )}
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[
                                  styles.cancelButton,
                                  isUpdating &&
                                    styles.disabledButton,
                                ]}
                                disabled={
                                  isUpdating
                                }
                                onPress={() =>
                                  confirmStatusUpdate(
                                    appointment.id,
                                    'Cancelled',
                                  )
                                }
                              >
                                <Text
                                  style={
                                    styles.actionText
                                  }
                                >
                                  Cancel
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}

                      {/* Prescription */}
                      {isCompleted && (
                        <View
                          style={
                            styles.completedSection
                          }
                        >
                          <View
                            style={
                              styles.completedMessage
                            }
                          >
                            <Text
                              style={
                                styles.completedIcon
                              }
                            >
                              ✓
                            </Text>

                            <Text
                              style={
                                styles.completedText
                              }
                            >
                              Appointment completed
                            </Text>
                          </View>

                          <TouchableOpacity
                            style={
                              styles.prescriptionButton
                            }
                            onPress={() =>
                              router.push({
                                pathname:
                                  '/add-prescription',
                                params: {
                                  appointmentId:
                                    appointment.id,
                                  patientId:
                                    appointment.patientId,
                                  doctorName:
                                    appointment.doctorName,
                                },
                              })
                            }
                          >
                            <Text
                              style={
                                styles.prescriptionIcon
                              }
                            >
                              +
                            </Text>

                            <Text
                              style={
                                styles.prescriptionButtonText
                              }
                            >
                              Add Prescription
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Bill */}
                      {!isCancelled && (
                        <TouchableOpacity
                          style={
                            styles.billButton
                          }
                          onPress={() =>
                            router.push({
                              pathname:
                                '/add-bill',
                              params: {
                                appointmentId:
                                  appointment.id,
                                patientId:
                                  appointment.patientId,
                                doctorName:
                                  appointment.doctorName,
                              },
                            })
                          }
                        >
                          <Text
                            style={
                              styles.billIcon
                            }
                          >
                            ₹
                          </Text>

                          <Text
                            style={
                              styles.billButtonText
                            }
                          >
                            Add Bill
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                },
              )}
            </>
          )}

          {/* Bottom Info */}
          {appointments.length > 0 && (
            <View style={styles.bottomInfo}>
              <Text style={styles.bottomInfoIcon}>
                🔄
              </Text>

              <Text style={styles.bottomInfoText}>
                Appointment updates appear
                automatically.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FC',
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 35,
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

  backButtonText: {
    fontSize: 32,
    lineHeight: 34,
    color: '#1769AA',
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

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },

  loadingText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 21,
  },

  scrollContent: {
    paddingBottom: 35,
  },

  summaryCard: {
    backgroundColor: '#1769AA',
    borderRadius: 20,
    padding: 19,
    marginBottom: 14,
  },

  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  summarySubtitle: {
    fontSize: 12,
    color: '#DCEEFF',
    marginTop: 4,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#B7F7C2',
    marginRight: 5,
  },

  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryNumber: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  summaryLabel: {
    fontSize: 11,
    color: '#DCEEFF',
    marginTop: 3,
  },

  summaryDivider: {
    width: 1,
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  cancelledInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 13,
    padding: 12,
    marginBottom: 18,
  },

  cancelledInfoIcon: {
    fontSize: 17,
    color: '#C2410C',
    marginRight: 9,
  },

  cancelledInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#9A3412',
    lineHeight: 18,
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
    fontSize: 12,
    color: '#718096',
    marginTop: 3,
  },

  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
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
    marginBottom: 17,
  },

  patientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  patientIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  patientIcon: {
    fontSize: 21,
  },

  patientTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
  },

  patientSubtitle: {
    fontSize: 11,
    color: '#8A94A6',
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    marginLeft: 8,
  },

  bookedBadge: {
    backgroundColor: '#FFF3CD',
  },

  completedBadge: {
    backgroundColor: '#D4EDDA',
  },

  cancelledBadge: {
    backgroundColor: '#F8D7DA',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
  },

  detailsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },

  detailRowLast: {
    marginBottom: 0,
  },

  detailIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  detailIcon: {
    fontSize: 15,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 10,
    color: '#8A94A6',
    fontWeight: '600',
    marginBottom: 2,
  },

  detailValue: {
    fontSize: 14,
    color: '#27303F',
    fontWeight: '600',
  },

  patientIdContainer: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDF1F5',
  },

  patientIdLabel: {
    fontSize: 10,
    color: '#8A94A6',
    fontWeight: '600',
    marginBottom: 3,
  },

  patientId: {
    fontSize: 11,
    color: '#687385',
  },

  updatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingVertical: 9,
    marginTop: 13,
  },

  updatingText: {
    fontSize: 12,
    color: '#1769AA',
    fontWeight: '600',
    marginLeft: 7,
  },

  actionsSection: {
    marginTop: 17,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#EDF1F5',
  },

  actionsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#596579',
    marginBottom: 9,
  },

  actions: {
    flexDirection: 'row',
    gap: 9,
  },

  completeButton: {
    flex: 1,
    minHeight: 44,
    backgroundColor: '#198754',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButton: {
    flex: 1,
    minHeight: 44,
    backgroundColor: '#DC3545',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    opacity: 0.55,
  },

  actionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  completedSection: {
    marginTop: 15,
  },

  completedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    borderRadius: 10,
    padding: 10,
    marginBottom: 9,
  },

  completedIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#198754',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 13,
    fontWeight: '800',
    marginRight: 8,
  },

  completedText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '700',
  },

  prescriptionButton: {
    minHeight: 45,
    backgroundColor: '#1769AA',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  prescriptionIcon: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '500',
    marginRight: 7,
  },

  prescriptionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  billButton: {
    minHeight: 45,
    backgroundColor: '#16A34A',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },

  billIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginRight: 7,
  },

  billButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginTop: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  emptyIcon: {
    fontSize: 34,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 21,
  },

  emptyHint: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginTop: 17,
  },

  emptyHintText: {
    fontSize: 11,
    color: '#718096',
    textAlign: 'center',
  },

  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    paddingVertical: 10,
  },

  bottomInfoIcon: {
    fontSize: 14,
    marginRight: 6,
  },

  bottomInfoText: {
    fontSize: 11,
    color: '#8A94A6',
  },
});