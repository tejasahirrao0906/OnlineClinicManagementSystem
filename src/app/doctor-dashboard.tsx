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
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

import { auth, db } from '../firebaseConfig';

export default function DoctorDashboardScreen() {
  const [doctorName, setDoctorName] = useState('');

  const [totalAppointments, setTotalAppointments] =
    useState(0);

  const [totalPatients, setTotalPatients] =
    useState(0);

  const [confirmedAppointments, setConfirmedAppointments] =
    useState(0);

  const [completedAppointments, setCompletedAppointments] =
    useState(0);

  const [cancelledAppointments, setCancelledAppointments] =
    useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    let unsubscribeAppointments:
      | (() => void)
      | null = null;

    const verifyDoctorAndLoadDashboard =
      async () => {
        try {
          const user = auth.currentUser;

          // Check authentication
          if (!user) {
            Alert.alert(
              'Login Required',
              'Please login as a doctor first.',
            );

            router.replace('/doctor-login');
            return;
          }

          // Find doctor profile
          const doctorsQuery = query(
            collection(db, 'doctors'),
            where('uid', '==', user.uid),
          );

          const doctorsSnapshot =
            await getDocs(doctorsQuery);

          // Authenticated user is not a doctor
          if (doctorsSnapshot.empty) {
            Alert.alert(
              'Access Denied',
              'This account is not registered as a doctor.',
            );

            await auth.signOut();

            router.replace('/doctor-login');
            return;
          }

          // Get doctor information
          const doctorDocument =
            doctorsSnapshot.docs[0];

          const doctorData =
            doctorDocument.data();

          const currentDoctorId =
            doctorDocument.id;

          if (!mounted) {
            return;
          }

          setDoctorName(
            doctorData.name || 'Doctor',
          );

          // Load doctor appointments
          const appointmentsQuery = query(
            collection(db, 'appointments'),
            where(
              'doctorId',
              '==',
              currentDoctorId,
            ),
          );

          unsubscribeAppointments =
            onSnapshot(
              appointmentsQuery,
              (snapshot) => {
                if (!mounted) {
                  return;
                }

                setTotalAppointments(
                  snapshot.size,
                );

                let confirmedCount = 0;
                let completedCount = 0;
                let cancelledCount = 0;

                const uniquePatientIds =
                  new Set<string>();

                snapshot.docs.forEach(
                  (appointmentDoc) => {
                    const data =
                      appointmentDoc.data();

                    if (data.patientId) {
                      uniquePatientIds.add(
                        data.patientId,
                      );
                    }

                    if (
                      data.status ===
                      'Confirmed'
                    ) {
                      confirmedCount++;
                    }

                    if (
                      data.status ===
                      'Completed'
                    ) {
                      completedCount++;
                    }

                    if (
                      data.status ===
                      'Cancelled'
                    ) {
                      cancelledCount++;
                    }
                  },
                );

                setTotalPatients(
                  uniquePatientIds.size,
                );

                setConfirmedAppointments(
                  confirmedCount,
                );

                setCompletedAppointments(
                  completedCount,
                );

                setCancelledAppointments(
                  cancelledCount,
                );

                setLoading(false);
              },
              (error) => {
                console.log(
                  'Doctor dashboard appointment error:',
                  error,
                );

                if (mounted) {
                  setLoading(false);

                  Alert.alert(
                    'Error',
                    'Unable to load dashboard statistics.',
                  );
                }
              },
            );
        } catch (error) {
          console.log(
            'Doctor dashboard verification error:',
            error,
          );

          if (mounted) {
            Alert.alert(
              'Error',
              'Unable to verify doctor access.',
            );

            await auth.signOut();

            router.replace('/doctor-login');
          }
        }
      };

    verifyDoctorAndLoadDashboard();

    return () => {
      mounted = false;

      if (unsubscribeAppointments) {
        unsubscribeAppointments();
      }
    };
  }, []);

  // Loading screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Text style={styles.loadingIconText}>
            🩺
          </Text>
        </View>

        <ActivityIndicator
          size="large"
          color="#1769AA"
        />

        <Text style={styles.loadingText}>
          Loading doctor dashboard...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>
            ‹
          </Text>

          <Text style={styles.backText}>
            Back
          </Text>
        </TouchableOpacity>

        <View style={styles.headerTitleRow}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>
              🩺
            </Text>
          </View>

          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              Doctor Dashboard
            </Text>

            <Text style={styles.subtitle}>
              Manage appointments and patient
              consultations
            </Text>
          </View>
        </View>
      </View>

      {/* Doctor Welcome Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            👨‍⚕️
          </Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.welcomeLabel}>
            Welcome back
          </Text>

          <Text style={styles.welcomeText}>
            Dr. {doctorName}
          </Text>

          <Text style={styles.profileDescription}>
            Here's an overview of your clinic
            activity.
          </Text>
        </View>
      </View>

      {/* Overview */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Overview
        </Text>

        <Text style={styles.liveText}>
          ● Live
        </Text>
      </View>

      <View style={styles.mainStatsRow}>
        {/* Appointments */}
        <View style={styles.mainStatCard}>
          <View
            style={[
              styles.mainStatIcon,
              styles.appointmentIcon,
            ]}
          >
            <Text style={styles.mainStatIconText}>
              📅
            </Text>
          </View>

          <Text style={styles.mainStatNumber}>
            {totalAppointments}
          </Text>

          <Text style={styles.mainStatLabel}>
            Total Appointments
          </Text>
        </View>

        {/* Patients */}
        <View style={styles.mainStatCard}>
          <View
            style={[
              styles.mainStatIcon,
              styles.patientIcon,
            ]}
          >
            <Text style={styles.mainStatIconText}>
              👥
            </Text>
          </View>

          <Text style={styles.mainStatNumber}>
            {totalPatients}
          </Text>

          <Text style={styles.mainStatLabel}>
            Unique Patients
          </Text>
        </View>
      </View>

      {/* Appointment Status */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Appointment Status
        </Text>
      </View>

      <View style={styles.statusGrid}>
        {/* Confirmed */}
        <View
          style={[
            styles.statusCard,
            styles.confirmedCard,
          ]}
        >
          <View style={styles.statusIconCircle}>
            <Text style={styles.statusIcon}>
              ✓
            </Text>
          </View>

          <Text style={styles.statusNumber}>
            {confirmedAppointments}
          </Text>

          <Text style={styles.statusLabel}>
            Confirmed
          </Text>
        </View>

        {/* Completed */}
        <View
          style={[
            styles.statusCard,
            styles.completedCard,
          ]}
        >
          <View style={styles.statusIconCircle}>
            <Text
              style={[
                styles.statusIcon,
                styles.completedIcon,
              ]}
            >
              ✓
            </Text>
          </View>

          <Text style={styles.statusNumber}>
            {completedAppointments}
          </Text>

          <Text style={styles.statusLabel}>
            Completed
          </Text>
        </View>

        {/* Cancelled */}
        <View
          style={[
            styles.statusCard,
            styles.cancelledCard,
          ]}
        >
          <View style={styles.statusIconCircle}>
            <Text
              style={[
                styles.statusIcon,
                styles.cancelledIcon,
              ]}
            >
              ✕
            </Text>
          </View>

          <Text style={styles.statusNumber}>
            {cancelledAppointments}
          </Text>

          <Text style={styles.statusLabel}>
            Cancelled
          </Text>
        </View>
      </View>

      {/* Manage Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Manage
        </Text>
      </View>

      {/* My Appointments */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() =>
          router.push('/doctor-appointments')
        }
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.menuIconContainer,
            styles.appointmentMenuIcon,
          ]}
        >
          <Text style={styles.menuIcon}>
            📋
          </Text>
        </View>

        <View style={styles.menuInfo}>
          <Text style={styles.menuTitle}>
            My Appointments
          </Text>

          <Text style={styles.menuDescription}>
            View and manage patient appointments
          </Text>
        </View>

        <View style={styles.arrowCircle}>
          <Text style={styles.arrow}>
            →
          </Text>
        </View>
      </TouchableOpacity>

      {/* Prescriptions */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() =>
          router.push('/doctor-prescriptions')
        }
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.menuIconContainer,
            styles.prescriptionMenuIcon,
          ]}
        >
          <Text style={styles.menuIcon}>
            💊
          </Text>
        </View>

        <View style={styles.menuInfo}>
          <Text style={styles.menuTitle}>
            Prescriptions
          </Text>

          <Text style={styles.menuDescription}>
            Add and manage patient prescriptions
          </Text>
        </View>

        <View style={styles.arrowCircle}>
          <Text style={styles.arrow}>
            →
          </Text>
        </View>
      </TouchableOpacity>

      {/* Quick Information */}
      <View style={styles.infoCard}>
        <View style={styles.infoIconCircle}>
          <Text style={styles.infoIcon}>
            ℹ️
          </Text>
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>
            Dashboard updates automatically
          </Text>

          <Text style={styles.infoText}>
            Appointment statistics update in real
            time when appointment records change.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F9FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  loadingIconText: {
    fontSize: 31,
  },

  loadingText: {
    marginTop: 11,
    color: '#667085',
    fontSize: 14,
  },

  container: {
    flex: 1,
    backgroundColor: '#F5F9FC',
  },

  content: {
    padding: 20,
    paddingTop: 45,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 20,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 17,
  },

  backArrow: {
    color: '#1769AA',
    fontSize: 29,
    lineHeight: 29,
    marginRight: 4,
    marginTop: -2,
  },

  backText: {
    color: '#1769AA',
    fontSize: 15,
    fontWeight: '700',
  },

  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerIconText: {
    fontSize: 27,
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    color: '#153B56',
    fontSize: 26,
    fontWeight: '800',
  },

  subtitle: {
    color: '#718096',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },

  profileCard: {
    backgroundColor: '#1769AA',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  profileAvatarText: {
    fontSize: 34,
  },

  profileInfo: {
    flex: 1,
  },

  welcomeLabel: {
    color: '#D9ECF8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },

  welcomeText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  profileDescription: {
    color: '#DDEFFA',
    fontSize: 12,
    marginTop: 5,
    lineHeight: 18,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 3,
  },

  sectionTitle: {
    color: '#153B56',
    fontSize: 18,
    fontWeight: '800',
  },

  liveText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '800',
  },

  mainStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  mainStatCard: {
    width: '48.2%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  mainStatIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  appointmentIcon: {
    backgroundColor: '#E8F2FA',
  },

  patientIcon: {
    backgroundColor: '#EEF6EF',
  },

  mainStatIconText: {
    fontSize: 21,
  },

  mainStatNumber: {
    color: '#153B56',
    fontSize: 27,
    fontWeight: '800',
  },

  mainStatLabel: {
    color: '#718096',
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },

  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  statusCard: {
    width: '31.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },

  confirmedCard: {
    borderColor: '#F1D88B',
  },

  completedCard: {
    borderColor: '#B8DDBD',
  },

  cancelledCard: {
    borderColor: '#E9B9B9',
  },

  statusIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7DD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  statusIcon: {
    fontSize: 17,
    fontWeight: '800',
    color: '#A15C00',
  },

  completedIcon: {
    color: '#2E7D32',
  },

  cancelledIcon: {
    color: '#C62828',
  },

  statusNumber: {
    color: '#153B56',
    fontSize: 21,
    fontWeight: '800',
  },

  statusLabel: {
    color: '#718096',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 3,
  },

  menuButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  appointmentMenuIcon: {
    backgroundColor: '#E8F2FA',
  },

  prescriptionMenuIcon: {
    backgroundColor: '#F0F7FC',
  },

  menuIcon: {
    fontSize: 24,
  },

  menuInfo: {
    flex: 1,
  },

  menuTitle: {
    color: '#263238',
    fontSize: 15,
    fontWeight: '800',
  },

  menuDescription: {
    color: '#7A8695',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },

  arrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrow: {
    color: '#1769AA',
    fontSize: 19,
    fontWeight: '800',
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EAF4FB',
    borderRadius: 15,
    padding: 14,
    marginTop: 4,
  },

  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  infoIcon: {
    fontSize: 15,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: '#153B56',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },

  infoText: {
    color: '#667085',
    fontSize: 11,
    lineHeight: 17,
  },
});