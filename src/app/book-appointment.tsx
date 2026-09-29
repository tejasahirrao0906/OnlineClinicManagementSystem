import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  doc,
  runTransaction,
} from 'firebase/firestore';

import { auth, db } from '../firebaseConfig';

type Doctor = {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  fees?: number;
};

const timeSlots = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
];

export default function BookAppointmentScreen() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingBooking, setLoadingBooking] = useState(false);

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const snapshot = await getDocs(
          collection(db, 'doctors')
        );

        const doctorList: Doctor[] = snapshot.docs.map((doctorDoc) => ({
          id: doctorDoc.id,
          ...(doctorDoc.data() as Omit<Doctor, 'id'>),
        }));

        setDoctors(doctorList);
      } catch (error) {
        console.log('Error loading doctors:', error);

        Alert.alert(
          'Unable to Load Doctors',
          'Please try again.'
        );
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, []);

  useEffect(() => {
    if (!selectedDoctor || !date.trim()) {
      setBookedSlots([]);
      return;
    }

    const slotsQuery = query(
      collection(db, 'appointmentSlots'),
      where('doctorId', '==', selectedDoctor),
      where('date', '==', date.trim())
    );

    const unsubscribe = onSnapshot(
      slotsQuery,
      (snapshot) => {
        const slots = snapshot.docs.map(
          (item) => item.data().time as string
        );

        setBookedSlots(slots);

        if (
          selectedTime &&
          slots.includes(selectedTime)
        ) {
          setSelectedTime('');
        }
      },
      (error) => {
        console.log(
          'Error loading booked slots:',
          error
        );
      }
    );

    return unsubscribe;
  }, [selectedDoctor, date, selectedTime]);

  const handleBooking = async () => {
    if (
      !selectedDoctor ||
      !date.trim() ||
      !selectedTime ||
      !reason.trim()
    ) {
      Alert.alert(
        'Missing Details',
        'Please select a doctor, date, time slot and enter your reason.'
      );
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login before booking an appointment.'
      );
      return;
    }

    const doctor = doctors.find(
      (item) => item.id === selectedDoctor
    );

    if (!doctor) {
      Alert.alert(
        'Error',
        'Selected doctor not found.'
      );
      return;
    }

    const cleanDate = date.trim();

    const cleanDateForId =
      cleanDate.replace(/\//g, '-');

    const cleanTimeForId = selectedTime
      .replace(/:/g, '-')
      .replace(/ /g, '-');

    const slotId =
      `${doctor.id}_${cleanDateForId}_${cleanTimeForId}`;

    console.log(
      'Selected doctor ID:',
      doctor.id
    );

    console.log(
      'Selected date:',
      cleanDate
    );

    console.log(
      'Selected time:',
      selectedTime
    );

    console.log(
      'Generated slot ID:',
      slotId
    );

    try {
      setLoadingBooking(true);

      const appointmentRef = doc(
        collection(db, 'appointments')
      );

      const slotRef = doc(
        db,
        'appointmentSlots',
        slotId
      );

      await runTransaction(
        db,
        async (transaction) => {

          // Check whether this exact slot already exists
          const slotSnapshot =
            await transaction.get(slotRef);

          console.log(
            'Does this slot already exist?',
            slotSnapshot.exists()
          );

          if (slotSnapshot.exists()) {
            throw new Error(
              'SLOT_ALREADY_BOOKED'
            );
          }

          // Create appointment
          transaction.set(
            appointmentRef,
            {
              patientId: user.uid,
              doctorId: doctor.id,
              doctorName: doctor.name,
              specialization:
                doctor.specialization || '',
              date: cleanDate,
              time: selectedTime,
              reason: reason.trim(),
              status: 'Confirmed',
              slotId: slotId,
              createdAt: serverTimestamp(),
            }
          );

          // Reserve exact doctor-date-time slot
          transaction.set(
            slotRef,
            {
              doctorId: doctor.id,
              doctorName: doctor.name,
              date: cleanDate,
              time: selectedTime,
              patientId: user.uid,
              appointmentId:
                appointmentRef.id,
              status: 'Booked',
              createdAt: serverTimestamp(),
            }
          );
        }
      );

      Alert.alert(
        'Appointment Booked',
        `Your appointment with ${doctor.name} has been booked successfully.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );

    } catch (error) {
      console.log(
        'Appointment booking error:',
        error
      );

      if (
        error instanceof Error &&
        error.message === 'SLOT_ALREADY_BOOKED'
      ) {
        Alert.alert(
          'Slot Unavailable',
          'This doctor, date and time slot is already booked. Please select another slot.'
        );
      } else {
        Alert.alert(
          'Booking Failed',
          'Unable to book the appointment. Please try again.'
        );
      }

    } finally {
      setLoadingBooking(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
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
          Book Appointment
        </Text>

        <Text style={styles.subtitle}>
          Schedule your consultation
        </Text>

      </View>

      {/* Step 1 */}
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>
            1
          </Text>
        </View>

        <View>
          <Text style={styles.stepTitle}>
            Select Doctor
          </Text>

          <Text style={styles.stepSubtitle}>
            Choose a doctor for your consultation
          </Text>
        </View>
      </View>

      {loadingDoctors ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator
            size="small"
            color="#1769AA"
          />

          <Text style={styles.loadingText}>
            Loading doctors...
          </Text>
        </View>
      ) : doctors.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>
            👨‍⚕️
          </Text>

          <Text style={styles.emptyTitle}>
            No Doctors Available
          </Text>

          <Text style={styles.emptyText}>
            There are currently no doctors available for appointments.
          </Text>
        </View>
      ) : (
        doctors.map((doctor) => (
          <TouchableOpacity
            key={doctor.id}
            style={[
              styles.doctorCard,
              selectedDoctor === doctor.id &&
                styles.selectedDoctorCard,
            ]}
            onPress={() =>
              setSelectedDoctor(doctor.id)
            }
            activeOpacity={0.8}
          >

            <View style={styles.doctorIconContainer}>
              <Text style={styles.doctorIcon}>
                👨‍⚕️
              </Text>
            </View>

            <View style={styles.doctorInfo}>

              <Text style={styles.doctorName}>
                {doctor.name}
              </Text>

              <Text style={styles.specialization}>
                {doctor.specialization}
              </Text>

              {doctor.experience ? (
                <Text style={styles.experience}>
                  {doctor.experience}
                </Text>
              ) : null}

            </View>

            {selectedDoctor === doctor.id && (
              <View style={styles.selectedCheck}>
                <Text style={styles.check}>
                  ✓
                </Text>
              </View>
            )}

          </TouchableOpacity>
        ))
      )}

      {/* Step 2 */}
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>
            2
          </Text>
        </View>

        <View>
          <Text style={styles.stepTitle}>
            Choose Date
          </Text>

          <Text style={styles.stepSubtitle}>
            Enter your preferred appointment date
          </Text>
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter date (e.g. 15/09/2026)"
        placeholderTextColor="#98A2B3"
        value={date}
        onChangeText={setDate}
      />

      {/* Step 3 */}
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>
            3
          </Text>
        </View>

        <View>
          <Text style={styles.stepTitle}>
            Choose Time
          </Text>

          <Text style={styles.stepSubtitle}>
            Select an available time slot
          </Text>
        </View>
      </View>

      {!selectedDoctor || !date.trim() ? (
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>
            ℹ️
          </Text>

          <Text style={styles.infoText}>
            Select a doctor and enter a date to view available time slots.
          </Text>
        </View>
      ) : (
        <View style={styles.timeContainer}>

          {timeSlots.map((time) => {
            const isBooked =
              bookedSlots.includes(time);

            return (
              <TouchableOpacity
                key={time}
                disabled={isBooked}
                style={[
                  styles.timeSlot,
                  selectedTime === time &&
                    styles.selectedTimeSlot,
                  isBooked &&
                    styles.bookedTimeSlot,
                ]}
                onPress={() =>
                  setSelectedTime(time)
                }
                activeOpacity={0.8}
              >

                <Text
                  style={[
                    styles.timeText,
                    selectedTime === time &&
                      styles.selectedTimeText,
                    isBooked &&
                      styles.bookedTimeText,
                  ]}
                >
                  {isBooked
                    ? `${time}\nBooked`
                    : time}
                </Text>

              </TouchableOpacity>
            );
          })}

        </View>
      )}

      {/* Step 4 */}
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>
            4
          </Text>
        </View>

        <View>
          <Text style={styles.stepTitle}>
            Reason for Visit
          </Text>

          <Text style={styles.stepSubtitle}>
            Tell the doctor why you need a consultation
          </Text>
        </View>
      </View>

      <TextInput
        style={styles.reasonInput}
        placeholder="Describe your symptoms or reason for consultation"
        placeholderTextColor="#98A2B3"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        value={reason}
        onChangeText={setReason}
      />

      {/* Confirm */}
      <TouchableOpacity
        style={[
          styles.confirmButton,
          loadingBooking &&
            styles.disabledButton,
        ]}
        onPress={handleBooking}
        disabled={loadingBooking}
        activeOpacity={0.8}
      >
        {loadingBooking ? (
          <View style={styles.loadingButtonContent}>

            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />

            <Text style={styles.confirmButtonText}>
              Booking Appointment...
            </Text>

          </View>
        ) : (
          <Text style={styles.confirmButtonText}>
            Confirm Appointment
          </Text>
        )}
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
    marginBottom: 24,
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

  /* Step Header */

  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 23,
    marginBottom: 13,
  },

  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  stepNumberText: {
    color: '#1769AA',
    fontSize: 15,
    fontWeight: 'bold',
  },

  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  stepSubtitle: {
    fontSize: 12,
    color: '#98A2B3',
    marginTop: 2,
  },

  /* Doctor */

  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 16,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#E0E8EF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  selectedDoctorCard: {
    borderColor: '#1769AA',
    borderWidth: 2,
    backgroundColor: '#F8FBFD',
  },

  doctorIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
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

  experience: {
    fontSize: 12,
    color: '#667085',
    marginTop: 3,
  },

  selectedCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1769AA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  check: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  /* Loading / Empty */

  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 2,
  },

  loadingText: {
    color: '#667085',
    fontSize: 14,
    marginLeft: 9,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    elevation: 2,
  },

  emptyIcon: {
    fontSize: 38,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  emptyText: {
    fontSize: 13,
    color: '#667085',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 5,
  },

  /* Date */

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E2EC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },

  /* Info */

  infoCard: {
    backgroundColor: '#F8FBFD',
    borderWidth: 1,
    borderColor: '#D5E2EC',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    fontSize: 18,
    marginRight: 9,
  },

  infoText: {
    flex: 1,
    color: '#667085',
    fontSize: 13,
    lineHeight: 18,
  },

  /* Time */

  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  timeSlot: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E2EC',
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    minHeight: 48,
  },

  selectedTimeSlot: {
    backgroundColor: '#1769AA',
    borderColor: '#1769AA',
  },

  bookedTimeSlot: {
    backgroundColor: '#EEEEEE',
    borderColor: '#D0D0D0',
    opacity: 0.7,
  },

  timeText: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },

  selectedTimeText: {
    color: '#FFFFFF',
  },

  bookedTimeText: {
    color: '#888888',
  },

  /* Reason */

  reasonInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E2EC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 115,
  },

  /* Confirm */

  confirmButton: {
    backgroundColor: '#1769AA',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },

  disabledButton: {
    opacity: 0.7,
  },

  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});