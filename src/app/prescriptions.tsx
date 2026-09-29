import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

import { auth, db } from '../firebaseConfig';

type Prescription = {
  id: string;
  medicineName: string;
  dosage: string;
  duration: string;
  instructions: string;
  doctorName: string;
  createdAt?: any;
};

export default function PrescriptionsScreen() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login to view your prescriptions.'
      );

      setLoading(false);
      return;
    }

    const prescriptionsQuery = query(
      collection(db, 'prescriptions'),
      where('patientId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      prescriptionsQuery,
      (snapshot) => {
        const prescriptionList: Prescription[] = snapshot.docs.map(
          (document) => {
            const data = document.data();

            return {
              id: document.id,
              medicineName: data.medicineName || 'Not provided',
              dosage: data.dosage || 'Not provided',
              duration: data.duration || 'Not provided',
              instructions:
                data.instructions || 'No instructions',
              doctorName: data.doctorName || 'Doctor',
              createdAt: data.createdAt,
            };
          }
        );

        setPrescriptions(prescriptionList);
        setLoading(false);
      },
      (error) => {
        console.log(
          'Prescription loading error:',
          error
        );

        Alert.alert(
          'Error',
          'Unable to load prescriptions. Please try again.'
        );

        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Text style={styles.loadingIconText}>💊</Text>
        </View>

        <ActivityIndicator
          size="large"
          color="#1769AA"
        />

        <Text style={styles.loadingText}>
          Loading prescriptions...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>💊</Text>
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>
            My Prescriptions
          </Text>

          <Text style={styles.subtitle}>
            Medicines prescribed by your doctor
          </Text>
        </View>
      </View>

      {/* Prescription Count */}
      {prescriptions.length > 0 && (
        <View style={styles.countBanner}>
          <View style={styles.countIcon}>
            <Text style={styles.countIconText}>✓</Text>
          </View>

          <View>
            <Text style={styles.countTitle}>
              Active Prescription Records
            </Text>

            <Text style={styles.countText}>
              {prescriptions.length}{' '}
              {prescriptions.length === 1
                ? 'prescription'
                : 'prescriptions'}{' '}
              available
            </Text>
          </View>
        </View>
      )}

      {/* Empty State */}
      {prescriptions.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIcon}>💊</Text>
          </View>

          <Text style={styles.emptyTitle}>
            No Prescriptions Yet
          </Text>

          <Text style={styles.emptyText}>
            Your prescriptions will appear here after a
            doctor adds them to your medical record.
          </Text>
        </View>
      ) : (
        prescriptions.map((prescription, index) => (
          <View
            style={styles.card}
            key={prescription.id}
          >
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.medicineIcon}>
                <Text style={styles.medicineIconText}>
                  💊
                </Text>
              </View>

              <View style={styles.medicineHeaderInfo}>
                <Text style={styles.medicineLabel}>
                  MEDICINE
                </Text>

                <Text style={styles.cardTitle}>
                  {prescription.medicineName}
                </Text>
              </View>

              <View style={styles.numberBadge}>
                <Text style={styles.numberBadgeText}>
                  {index + 1}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Doctor */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Text style={styles.infoIcon}>👨‍⚕️</Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>
                  Prescribed By
                </Text>

                <Text style={styles.infoValue}>
                  {prescription.doctorName}
                </Text>
              </View>
            </View>

            {/* Dosage */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Text style={styles.infoIcon}>⚕️</Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>
                  Dosage
                </Text>

                <Text style={styles.infoValue}>
                  {prescription.dosage}
                </Text>
              </View>
            </View>

            {/* Duration */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Text style={styles.infoIcon}>🗓️</Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>
                  Duration
                </Text>

                <Text style={styles.infoValue}>
                  {prescription.duration}
                </Text>
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsBox}>
              <View style={styles.instructionsHeader}>
                <Text style={styles.instructionsIcon}>
                  ℹ️
                </Text>

                <Text style={styles.instructionsLabel}>
                  Instructions
                </Text>
              </View>

              <Text style={styles.instructionsText}>
                {prescription.instructions}
              </Text>
            </View>
          </View>
        ))
      )}

      {/* Bottom Note */}
      {prescriptions.length > 0 && (
        <View style={styles.bottomNote}>
          <Text style={styles.bottomNoteIcon}>ℹ️</Text>

          <Text style={styles.bottomNoteText}>
            Follow your doctor's instructions and dosage.
            Do not change or stop your medication without
            consulting your doctor.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F9FC',
  },

  container: {
    padding: 20,
    paddingTop: 45,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F9FC',
  },

  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  loadingIconText: {
    fontSize: 30,
  },

  loadingText: {
    marginTop: 10,
    color: '#667085',
    fontSize: 14,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  headerIconText: {
    fontSize: 30,
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#153B56',
  },

  subtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 4,
  },

  countBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF4FB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },

  countIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  countIconText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1769AA',
  },

  countTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#153B56',
  },

  countText: {
    fontSize: 12,
    color: '#667085',
    marginTop: 2,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyIcon: {
    fontSize: 36,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#153B56',
    marginBottom: 9,
  },

  emptyText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 21,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  medicineIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EAF4FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  medicineIconText: {
    fontSize: 25,
  },

  medicineHeaderInfo: {
    flex: 1,
  },

  medicineLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A94A6',
    letterSpacing: 0.8,
    marginBottom: 3,
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1769AA',
  },

  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  numberBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#667085',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF1F4',
    marginVertical: 16,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  infoIcon: {
    fontSize: 19,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 11,
    color: '#8A94A6',
    marginBottom: 3,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#263238',
  },

  instructionsBox: {
    marginTop: 2,
    padding: 14,
    backgroundColor: '#F0F7FC',
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#1769AA',
  },

  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  instructionsIcon: {
    fontSize: 15,
    marginRight: 6,
  },

  instructionsLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1769AA',
  },

  instructionsText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 21,
  },

  bottomNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9E8',
    borderRadius: 14,
    padding: 14,
    marginTop: 2,
  },

  bottomNoteIcon: {
    fontSize: 15,
    marginRight: 8,
  },

  bottomNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#7A6840',
    lineHeight: 18,
  },
});