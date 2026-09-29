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
} from 'firebase/firestore';

import { auth, db } from '../firebaseConfig';

type Prescription = {
  id: string;
  patientId: string;
  medicineName: string;
  dosage: string;
  duration: string;
  instructions: string;
  doctorName: string;
};

export default function DoctorPrescriptionsScreen() {
  const [prescriptions, setPrescriptions] =
    useState<Prescription[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    // ================================
    // CHECK DOCTOR AUTHENTICATION
    // ================================
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login as a doctor first.',
      );

      router.replace('/doctor-login');

      setLoading(false);

      return;
    }

    // ================================
    // LOAD ONLY THIS DOCTOR'S
    // PRESCRIPTIONS
    // ================================
    const prescriptionsQuery = query(
      collection(db, 'prescriptions'),
      where('doctorId', '==', user.uid),
    );

    const unsubscribe = onSnapshot(
      prescriptionsQuery,
      (snapshot) => {
        const prescriptionList: Prescription[] =
          snapshot.docs.map((document) => {
            const data =
              document.data();

            return {
              id: document.id,

              patientId:
                data.patientId || 'Not provided',

              medicineName:
                data.medicineName || 'Not provided',

              dosage:
                data.dosage || 'Not provided',

              duration:
                data.duration || 'Not provided',

              instructions:
                data.instructions ||
                'No instructions',

              doctorName:
                data.doctorName || 'Doctor',
            };
          });

        setPrescriptions(
          prescriptionList,
        );

        setLoading(false);
      },
      (error) => {
        console.log(
          'Doctor prescription loading error:',
          error,
        );

        Alert.alert(
          'Error',
          'Unable to load prescriptions.',
        );

        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  // ================================
  // LOADING SCREEN
  // ================================
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCircle}>
          <ActivityIndicator
            size="large"
            color="#1769AA"
          />
        </View>

        <Text style={styles.loadingTitle}>
          Loading prescriptions
        </Text>

        <Text style={styles.loadingText}>
          Please wait while we fetch your prescriptions.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ‹
            </Text>
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              My Prescriptions
            </Text>

            <Text style={styles.subtitle}>
              Prescriptions created by you
            </Text>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconCircle}>
            <Text style={styles.summaryIcon}>
              💊
            </Text>
          </View>

          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>
              Prescription Records
            </Text>

            <Text style={styles.summaryText}>
              {prescriptions.length}{' '}
              prescription
              {prescriptions.length !== 1
                ? 's'
                : ''}{' '}
              created
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
        {prescriptions.length > 0 && (
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Prescription History
              </Text>

              <Text style={styles.sectionSubtitle}>
                Medicines prescribed to your patients
              </Text>
            </View>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {prescriptions.length}
              </Text>
            </View>
          </View>
        )}

        {/* Empty State */}
        {prescriptions.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>
                💊
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              No Prescriptions Yet
            </Text>

            <Text style={styles.emptyText}>
              Prescriptions you create for your
              patients will appear here.
            </Text>

            <View style={styles.emptyHint}>
              <Text style={styles.emptyHintIcon}>
                ℹ
              </Text>

              <Text style={styles.emptyHintText}>
                Complete an appointment and add a
                prescription from the appointment
                management screen.
              </Text>
            </View>
          </View>
        ) : (
          prescriptions.map(
            (prescription, index) => (
              <View
                key={prescription.id}
                style={styles.card}
              >
                {/* Prescription Number */}
                <View style={styles.cardTopRow}>
                  <Text style={styles.recordText}>
                    Prescription #{index + 1}
                  </Text>

                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>
                      RECORD
                    </Text>
                  </View>
                </View>

                {/* Medicine Header */}
                <View style={styles.medicineSection}>
                  <View style={styles.medicineIconCircle}>
                    <Text style={styles.medicineIcon}>
                      💊
                    </Text>
                  </View>

                  <View style={styles.medicineInfo}>
                    <Text
                      style={styles.medicineName}
                    >
                      {prescription.medicineName}
                    </Text>

                    <Text
                      style={styles.doctorName}
                    >
                      {prescription.doctorName}
                    </Text>
                  </View>
                </View>

                {/* Patient */}
                <View style={styles.patientBox}>
                  <View style={styles.patientIconCircle}>
                    <Text style={styles.patientIcon}>
                      👤
                    </Text>
                  </View>

                  <View style={styles.patientContent}>
                    <Text style={styles.infoLabel}>
                      Patient ID
                    </Text>

                    <Text
                      style={styles.patientValue}
                      numberOfLines={1}
                    >
                      {prescription.patientId}
                    </Text>
                  </View>
                </View>

                {/* Medicine Details */}
                <View style={styles.detailsCard}>
                  <View style={styles.detailItem}>
                    <View style={styles.detailIconCircle}>
                      <Text style={styles.detailIcon}>
                        💊
                      </Text>
                    </View>

                    <View style={styles.detailContent}>
                      <Text style={styles.infoLabel}>
                        Dosage
                      </Text>

                      <Text style={styles.infoValue}>
                        {prescription.dosage}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailDivider} />

                  <View style={styles.detailItem}>
                    <View style={styles.detailIconCircle}>
                      <Text style={styles.detailIcon}>
                        🗓️
                      </Text>
                    </View>

                    <View style={styles.detailContent}>
                      <Text style={styles.infoLabel}>
                        Duration
                      </Text>

                      <Text style={styles.infoValue}>
                        {prescription.duration}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Instructions */}
                <View style={styles.instructionsBox}>
                  <View style={styles.instructionsHeader}>
                    <View style={styles.instructionsIconCircle}>
                      <Text style={styles.instructionsIcon}>
                        ℹ
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.instructionsLabel
                      }
                    >
                      Instructions
                    </Text>
                  </View>

                  <Text
                    style={styles.instructionsText}
                  >
                    {prescription.instructions}
                  </Text>
                </View>

                {/* Record ID */}
                <View style={styles.recordIdContainer}>
                  <Text style={styles.recordIdLabel}>
                    Prescription ID
                  </Text>

                  <Text
                    style={styles.recordId}
                    numberOfLines={1}
                  >
                    {prescription.id}
                  </Text>
                </View>
              </View>
            ),
          )
        )}

        {/* Bottom Information */}
        {prescriptions.length > 0 && (
          <View style={styles.bottomInfo}>
            <Text style={styles.bottomInfoIcon}>
              🔄
            </Text>

            <Text style={styles.bottomInfoText}>
              Prescription records update automatically.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FC',
    paddingHorizontal: 20,
  },

  scrollContent: {
    paddingBottom: 35,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 35,
    marginBottom: 20,
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

  backText: {
    color: '#1769AA',
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '400',
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    color: '#1769AA',
    fontSize: 25,
    fontWeight: '800',
  },

  subtitle: {
    color: '#718096',
    fontSize: 13,
    marginTop: 3,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F9FC',
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
    marginTop: 7,
    color: '#718096',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },

  summaryCard: {
    backgroundColor: '#1769AA',
    borderRadius: 20,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  summaryIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  summaryIcon: {
    fontSize: 25,
  },

  summaryContent: {
    flex: 1,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  summaryText: {
    fontSize: 12,
    color: '#DCEEFF',
    marginTop: 3,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 8,
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
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  countBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
  },

  countText: {
    color: '#1769AA',
    fontSize: 13,
    fontWeight: '800',
  },

  card: {
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

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  recordText: {
    fontSize: 11,
    color: '#8A94A6',
    fontWeight: '700',
  },

  activeBadge: {
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },

  activeBadgeText: {
    fontSize: 9,
    color: '#15803D',
    fontWeight: '800',
  },

  medicineSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  medicineIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  medicineIcon: {
    fontSize: 26,
  },

  medicineInfo: {
    flex: 1,
  },

  medicineName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1769AA',
  },

  doctorName: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },

  patientBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 13,
    padding: 11,
    marginBottom: 12,
  },

  patientIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  patientIcon: {
    fontSize: 16,
  },

  patientContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 10,
    color: '#8A94A6',
    fontWeight: '600',
    marginBottom: 3,
  },

  patientValue: {
    fontSize: 12,
    color: '#27303F',
    fontWeight: '600',
  },

  detailsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 13,
    padding: 11,
    marginBottom: 12,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailIconCircle: {
    width: 35,
    height: 35,
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

  infoValue: {
    fontSize: 14,
    color: '#27303F',
    fontWeight: '700',
  },

  detailDivider: {
    height: 1,
    backgroundColor: '#E7ECF2',
    marginVertical: 10,
  },

  instructionsBox: {
    backgroundColor: '#EEF7FF',
    borderRadius: 13,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D9ECFB',
  },

  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  instructionsIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#DCEEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  instructionsIcon: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1769AA',
  },

  instructionsLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1769AA',
  },

  instructionsText: {
    fontSize: 13,
    color: '#425466',
    lineHeight: 20,
  },

  recordIdContainer: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#EDF1F5',
  },

  recordIdLabel: {
    fontSize: 9,
    color: '#9AA3B2',
    fontWeight: '600',
    marginBottom: 3,
  },

  recordId: {
    fontSize: 10,
    color: '#7A8494',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginTop: 18,
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 11,
    padding: 11,
    marginTop: 17,
  },

  emptyHintIcon: {
    fontSize: 14,
    color: '#1769AA',
    fontWeight: '800',
    marginRight: 7,
  },

  emptyHintText: {
    flex: 1,
    fontSize: 11,
    color: '#718096',
    lineHeight: 17,
  },

  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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