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
  query,
  where,
  doc,
  runTransaction,
} from 'firebase/firestore';

import { auth, db } from '../firebaseConfig';

type Appointment = {
  id: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  slotId?: string;
};

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState('');

  const upcomingAppointments = appointments.filter(
    (appointment) =>
      appointment.status !== 'Cancelled' &&
      appointment.status !== 'Completed'
  );

  const cancelledAppointments = appointments.filter(
    (appointment) =>
      appointment.status === 'Cancelled'
  );

  const completedAppointments = appointments.filter(
    (appointment) =>
      appointment.status === 'Completed'
  );

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('patientId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        const appointmentList: Appointment[] =
          snapshot.docs.map((item) => {
            const data = item.data();

            return {
              id: item.id,
              doctorName:
                data.doctorName ||
                'Unknown Doctor',
              specialization:
                data.specialization || '',
              date: data.date || '',
              time: data.time || '',
              reason: data.reason || '',
              status:
                data.status || 'Confirmed',
              slotId: data.slotId || '',
            };
          });

        setAppointments(appointmentList);
        setLoading(false);
      },
      (error) => {
        console.log(
          'Appointment loading error:',
          error
        );

        setLoading(false);

        Alert.alert(
          'Error',
          'Unable to load your appointments.'
        );
      }
    );

    return unsubscribe;
  }, []);

  const cancelAppointment = (
    appointmentId: string,
    slotId?: string
  ) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancellingId(appointmentId);

              const appointmentRef = doc(
                db,
                'appointments',
                appointmentId
              );

              await runTransaction(
                db,
                async (transaction) => {
                  // Update appointment status
                  transaction.update(
                    appointmentRef,
                    {
                      status: 'Cancelled',
                    }
                  );

                  // Delete reserved slot
                  if (
                    slotId &&
                    slotId.trim() !== ''
                  ) {
                    const slotRef = doc(
                      db,
                      'appointmentSlots',
                      slotId
                    );

                    transaction.delete(slotRef);
                  }
                }
              );

              Alert.alert(
                'Appointment Cancelled',
                'Your appointment has been cancelled and the time slot is available again.'
              );
            } catch (error) {
              console.log(
                'Cancellation error:',
                error
              );

              Alert.alert(
                'Cancellation Failed',
                'Unable to cancel the appointment. Please try again.'
              );
            } finally {
              setCancellingId('');
            }
          },
        },
      ]
    );
  };

  const renderAppointmentCard = (
    appointment: Appointment
  ) => {
    const isUpcoming =
      appointment.status !== 'Cancelled' &&
      appointment.status !== 'Completed';

    const isCancelling =
      cancellingId === appointment.id;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          appointment.status ===
            'Cancelled' &&
            styles.cancelledCard,
          appointment.status ===
            'Completed' &&
            styles.completedCard,
        ]}
        key={appointment.id}
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname:
              '/appointment-details',
            params: {
              appointmentId:
                appointment.id,
              doctorName:
                appointment.doctorName,
              specialization:
                appointment.specialization,
              date:
                appointment.date,
              time:
                appointment.time,
              reason:
                appointment.reason,
              status:
                appointment.status,
            },
          })
        }
      >

        {/* Doctor Header */}
        <View style={styles.doctorRow}>

          <View style={styles.doctorIconContainer}>
            <Text style={styles.doctorIcon}>
              👨‍⚕️
            </Text>
          </View>

          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>
              {appointment.doctorName}
            </Text>

            <Text style={styles.specialization}>
              {appointment.specialization}
            </Text>
          </View>

          {/* Status */}
          <View
            style={[
              styles.statusBadge,
              appointment.status ===
                'Cancelled' &&
                styles.cancelledBadge,
              appointment.status ===
                'Completed' &&
                styles.completedBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                appointment.status ===
                  'Cancelled' &&
                  styles.cancelledText,
                appointment.status ===
                  'Completed' &&
                  styles.completedText,
              ]}
            >
              {appointment.status}
            </Text>
          </View>

        </View>

        <View style={styles.divider} />

        {isUpcoming && (
          <View style={styles.upcomingBanner}>
            <Text style={styles.upcomingIcon}>
              📌
            </Text>

            <Text style={styles.upcomingText}>
              Upcoming Appointment
            </Text>
          </View>
        )}

        {/* Date */}
        <View style={styles.detailRow}>

          <View style={styles.detailIconContainer}>
            <Text style={styles.detailIcon}>
              📅
            </Text>
          </View>

          <View>
            <Text style={styles.detailLabel}>
              Date
            </Text>

            <Text style={styles.detailValue}>
              {appointment.date}
            </Text>
          </View>

        </View>

        {/* Time */}
        <View style={styles.detailRow}>

          <View style={styles.detailIconContainer}>
            <Text style={styles.detailIcon}>
              ⏰
            </Text>
          </View>

          <View>
            <Text style={styles.detailLabel}>
              Time
            </Text>

            <Text style={styles.detailValue}>
              {appointment.time}
            </Text>
          </View>

        </View>

        {/* Reason */}
        <View style={styles.detailRow}>

          <View style={styles.detailIconContainer}>
            <Text style={styles.detailIcon}>
              📝
            </Text>
          </View>

          <View style={styles.reasonContainer}>
            <Text style={styles.detailLabel}>
              Reason for Visit
            </Text>

            <Text style={styles.detailValue}>
              {appointment.reason}
            </Text>
          </View>

        </View>

        {/* Cancel Button */}
        {isUpcoming && (
          <TouchableOpacity
            style={[
              styles.cancelButton,
              isCancelling &&
                styles.disabledCancelButton,
            ]}
            onPress={() =>
              cancelAppointment(
                appointment.id,
                appointment.slotId
              )
            }
            disabled={isCancelling}
            activeOpacity={0.8}
          >
            {isCancelling ? (
              <View style={styles.loadingCancel}>
                <ActivityIndicator
                  size="small"
                  color="#E53935"
                />

                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  Cancelling...
                </Text>
              </View>
            ) : (
              <Text
                style={
                  styles.cancelButtonText
                }
              >
                Cancel Appointment
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Cancelled */}
        {appointment.status ===
          'Cancelled' && (
          <View
            style={styles.cancelledMessage}
          >
            <Text style={styles.messageIcon}>
              ✓
            </Text>

            <Text
              style={styles.cancelledTitle}
            >
              Appointment Cancelled
            </Text>

            <Text
              style={
                styles.messageDescription
              }
            >
              This appointment is no longer active.
            </Text>
          </View>
        )}

        {/* Completed */}
        {appointment.status ===
          'Completed' && (
          <View
            style={styles.completedMessage}
          >
            <Text style={styles.messageIcon}>
              ✓
            </Text>

            <Text
              style={styles.completedTitle}
            >
              Appointment Completed
            </Text>

            <Text
              style={
                styles.messageDescription
              }
            >
              Your consultation has been completed.
            </Text>
          </View>
        )}

        <Text style={styles.detailsHint}>
          Tap appointment to view details
        </Text>

      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      {/* Header */}
      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          My Appointments
        </Text>

        <Text style={styles.subtitle}>
          View and manage your appointments
        </Text>

      </View>

      {/* Upcoming */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Upcoming Appointments
        </Text>

        {!loading &&
          upcomingAppointments.length >
            0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {upcomingAppointments.length}
              </Text>
            </View>
          )}
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator
            size="small"
            color="#1769AA"
          />

          <Text
            style={styles.emptyDescription}
          >
            Loading appointments...
          </Text>
        </View>
      ) : upcomingAppointments.length ===
        0 ? (
        <View style={styles.emptyState}>

          <Text style={styles.emptyIcon}>
            📅
          </Text>

          <Text style={styles.emptyTitle}>
            No Upcoming Appointments
          </Text>

          <Text
            style={styles.emptyDescription}
          >
            You do not have any upcoming appointments.
          </Text>

        </View>
      ) : (
        upcomingAppointments.map(
          renderAppointmentCard
        )
      )}

      {/* Cancelled */}
      {!loading &&
        cancelledAppointments.length >
          0 && (
          <>
            <View
              style={styles.sectionHeader}
            >
              <Text
                style={styles.sectionTitle}
              >
                Cancelled Appointments
              </Text>

              <View
                style={[
                  styles.countBadge,
                  styles.cancelledCountBadge,
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    styles.cancelledCountText,
                  ]}
                >
                  {
                    cancelledAppointments.length
                  }
                </Text>
              </View>
            </View>

            {cancelledAppointments.map(
              renderAppointmentCard
            )}
          </>
        )}

      {/* Completed */}
      {!loading &&
        completedAppointments.length >
          0 && (
          <>
            <View
              style={styles.sectionHeader}
            >
              <Text
                style={styles.sectionTitle}
              >
                Completed Appointments
              </Text>

              <View
                style={[
                  styles.countBadge,
                  styles.completedCountBadge,
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    styles.completedCountText,
                  ]}
                >
                  {
                    completedAppointments.length
                  }
                </Text>
              </View>
            </View>

            {completedAppointments.map(
              renderAppointmentCard
            )}
          </>
        )}

      {/* Book Another */}
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() =>
          router.push(
            '/book-appointment'
          )
        }
        activeOpacity={0.8}
      >
        <Text style={styles.bookButtonText}>
          + Book Another Appointment
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FC',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 40,
  },

  /* Header */

  header: {
    marginBottom: 27,
  },

  backText: {
    color: '#1769AA',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 18,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1769AA',
  },

  subtitle: {
    fontSize: 14,
    color: '#667085',
    marginTop: 6,
  },

  /* Sections */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 3,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  countBadge: {
    minWidth: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 9,
    paddingHorizontal: 7,
  },

  countText: {
    color: '#1769AA',
    fontSize: 12,
    fontWeight: 'bold',
  },

  cancelledCountBadge: {
    backgroundColor: '#FFEBEE',
  },

  cancelledCountText: {
    color: '#C62828',
  },

  completedCountBadge: {
    backgroundColor: '#E3F2FD',
  },

  completedCountText: {
    color: '#1565C0',
  },

  /* Appointment Card */

  card: {
    backgroundColor: '#FFFFFF',
    padding: 19,
    borderRadius: 18,
    marginBottom: 17,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  cancelledCard: {
    opacity: 0.88,
  },

  completedCard: {
    opacity: 0.94,
  },

  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  doctorIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  doctorIcon: {
    fontSize: 27,
  },

  doctorInfo: {
    flex: 1,
  },

  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  specialization: {
    fontSize: 13,
    color: '#1769AA',
    marginTop: 4,
    fontWeight: '600',
  },

  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 20,
  },

  cancelledBadge: {
    backgroundColor: '#FFEBEE',
  },

  completedBadge: {
    backgroundColor: '#E3F2FD',
  },

  statusText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: 'bold',
  },

  cancelledText: {
    color: '#C62828',
  },

  completedText: {
    color: '#1565C0',
  },

  divider: {
    height: 1,
    backgroundColor: '#EAECEF',
    marginVertical: 17,
  },

  upcomingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FC',
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },

  upcomingIcon: {
    fontSize: 14,
    marginRight: 7,
  },

  upcomingText: {
    color: '#1769AA',
    fontSize: 13,
    fontWeight: 'bold',
  },

  /* Details */

  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  detailIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5F9FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  detailIcon: {
    fontSize: 19,
  },

  detailLabel: {
    fontSize: 12,
    color: '#98A2B3',
    marginBottom: 3,
  },

  detailValue: {
    fontSize: 14,
    color: '#344054',
    fontWeight: '600',
  },

  reasonContainer: {
    flex: 1,
  },

  /* Cancel */

  cancelButton: {
    borderWidth: 1,
    borderColor: '#E53935',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },

  disabledCancelButton: {
    opacity: 0.7,
  },

  loadingCancel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  cancelButtonText: {
    color: '#E53935',
    fontSize: 14,
    fontWeight: 'bold',
  },

  /* Status Messages */

  cancelledMessage: {
    backgroundColor: '#F8F8F8',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 2,
  },

  completedMessage: {
    backgroundColor: '#F0F7FC',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 2,
  },

  messageIcon: {
    fontSize: 27,
    color: '#2E7D32',
  },

  cancelledTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#344054',
    marginTop: 4,
  },

  completedTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1565C0',
    marginTop: 4,
  },

  messageDescription: {
    fontSize: 12,
    color: '#667085',
    textAlign: 'center',
    marginTop: 4,
  },

  detailsHint: {
    textAlign: 'center',
    color: '#98A2B3',
    fontSize: 11,
    marginTop: 13,
  },

  /* Empty */

  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },

  emptyDescription: {
    fontSize: 13,
    color: '#667085',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 7,
  },

  /* Book */

  bookButton: {
    backgroundColor: '#1769AA',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 7,
  },

  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});