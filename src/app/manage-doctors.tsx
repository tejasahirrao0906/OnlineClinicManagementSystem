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
  deleteDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';

import { db } from '../firebaseConfig';

type Doctor = {
  id: string;
  name: string;
  specialization: string;
};

export default function ManageDoctorsScreen() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingDoctorId, setDeletingDoctorId] =
    useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'doctors'),
      (snapshot) => {
        const doctorList: Doctor[] = snapshot.docs.map((item) => {
          const data = item.data();

          return {
            id: item.id,
            name: data.name || 'Unknown Doctor',
            specialization:
              data.specialization || 'General Physician',
          };
        });

        setDoctors(doctorList);
        setLoading(false);
      },
      (error) => {
        console.log('Doctors loading error:', error);

        setLoading(false);

        Alert.alert(
          'Error',
          'Unable to load doctors. Please try again.',
        );
      },
    );

    return unsubscribe;
  }, []);

  const handleDeleteDoctor = (doctor: Doctor) => {
    Alert.alert(
      'Delete Doctor',
      `Are you sure you want to delete ${doctor.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingDoctorId(doctor.id);

              const doctorRef = doc(
                db,
                'doctors',
                doctor.id,
              );

              await deleteDoc(doctorRef);

              Alert.alert(
                'Doctor Deleted',
                `${doctor.name} has been deleted successfully.`,
              );
            } catch (error) {
              console.log(
                'Delete doctor error:',
                error,
              );

              Alert.alert(
                'Error',
                'Unable to delete doctor. Please try again.',
              );
            } finally {
              setDeletingDoctorId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>

            <Text style={styles.backText}>
              Back
            </Text>
          </TouchableOpacity>

          <View style={styles.headerRow}>
            <View style={styles.headerIconCircle}>
              <Text style={styles.headerIcon}>
                🩺
              </Text>
            </View>

            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>
                Manage Doctors
              </Text>

              <Text style={styles.subtitle}>
                Manage doctors registered in the clinic
              </Text>
            </View>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconCircle}>
            <Text style={styles.summaryIcon}>
              👨‍⚕️
            </Text>
          </View>

          <View style={styles.summaryContent}>
            <Text style={styles.summaryNumber}>
              {doctors.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Registered Doctors
            </Text>
          </View>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />

            <Text style={styles.liveText}>
              LIVE
            </Text>
          </View>
        </View>

        {/* Add Doctor */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-doctor')}
          activeOpacity={0.85}
        >
          <View style={styles.addIconCircle}>
            <Text style={styles.addIcon}>
              +
            </Text>
          </View>

          <View style={styles.addContent}>
            <Text style={styles.addButtonTitle}>
              Add New Doctor
            </Text>

            <Text style={styles.addButtonSubtitle}>
              Register a doctor in the clinic
            </Text>
          </View>

          <Text style={styles.addArrow}>
            ›
          </Text>
        </TouchableOpacity>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Doctor Directory
            </Text>

            <Text style={styles.sectionSubtitle}>
              {doctors.length === 0
                ? 'No doctors available'
                : 'View and manage registered doctors'}
            </Text>
          </View>
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
              Loading Doctors
            </Text>

            <Text style={styles.stateDescription}>
              Please wait while doctor records are loaded.
            </Text>
          </View>
        ) : doctors.length === 0 ? (
          /* Empty State */
          <View style={styles.stateCard}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>
                👨‍⚕️
              </Text>
            </View>

            <Text style={styles.stateTitle}>
              No Doctors Found
            </Text>

            <Text style={styles.stateDescription}>
              There are currently no doctors registered
              in the system.
            </Text>

            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() =>
                router.push('/add-doctor')
              }
              activeOpacity={0.8}
            >
              <Text style={styles.emptyAddButtonText}>
                + Add First Doctor
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Doctor List */
          <View>
            {doctors.map((doctor) => (
              <View
                key={doctor.id}
                style={styles.doctorCard}
              >
                {/* Doctor Header */}
                <View style={styles.doctorHeader}>
                  <View style={styles.doctorIconCircle}>
                    <Text style={styles.doctorIcon}>
                      👨‍⚕️
                    </Text>
                  </View>

                  <View style={styles.doctorInfo}>
                    <Text
                      style={styles.doctorName}
                      numberOfLines={1}
                    >
                      {doctor.name}
                    </Text>

                    <Text style={styles.specialization}>
                      {doctor.specialization}
                    </Text>
                  </View>

                  <View style={styles.activeBadge}>
                    <View style={styles.activeDot} />

                    <Text style={styles.activeText}>
                      Active
                    </Text>
                  </View>
                </View>

                {/* Doctor ID */}
                <View style={styles.idContainer}>
                  <Text style={styles.idLabel}>
                    Doctor ID
                  </Text>

                  <Text
                    style={styles.doctorId}
                    numberOfLines={1}
                  >
                    {doctor.id}
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.actionDivider} />

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() =>
                      router.push({
                        pathname: '/edit-doctor',
                        params: {
                          doctorId: doctor.id,
                          doctorName: doctor.name,
                          specialization:
                            doctor.specialization,
                        },
                      })
                    }
                    disabled={
                      deletingDoctorId === doctor.id
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.editIcon}>
                      ✎
                    </Text>

                    <Text style={styles.editButtonText}>
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() =>
                      handleDeleteDoctor(doctor)
                    }
                    disabled={
                      deletingDoctorId === doctor.id
                    }
                    activeOpacity={0.8}
                  >
                    {deletingDoctorId === doctor.id ? (
                      <ActivityIndicator
                        size="small"
                        color="#D32F2F"
                      />
                    ) : (
                      <>
                        <Text
                          style={styles.deleteIcon}
                        >
                          🗑
                        </Text>

                        <Text
                          style={
                            styles.deleteButtonText
                          }
                        >
                          Delete
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
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
          <Text style={styles.dashboardButtonText}>
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
    fontSize: 28,
  },

  headerTextContainer: {
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

  addButton: {
    backgroundColor: '#1769AA',
    borderRadius: 17,
    minHeight: 70,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#1769AA',
    shadowOpacity: 0.18,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  addIconCircle: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  addIcon: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '300',
    lineHeight: 30,
  },

  addContent: {
    flex: 1,
  },

  addButtonTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  addButtonSubtitle: {
    color: '#DCECF8',
    fontSize: 11,
    marginTop: 3,
  },

  addArrow: {
    color: '#FFFFFF',
    fontSize: 28,
    marginLeft: 8,
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

  emptyAddButton: {
    backgroundColor: '#1769AA',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 17,
  },

  emptyAddButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  doctorCard: {
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

  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  doctorIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  doctorIcon: {
    fontSize: 28,
  },

  doctorInfo: {
    flex: 1,
    marginRight: 8,
  },

  doctorName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },

  specialization: {
    fontSize: 12,
    color: '#1769AA',
    marginTop: 4,
    fontWeight: '700',
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

  doctorId: {
    fontSize: 10,
    color: '#64748B',
  },

  actionDivider: {
    height: 1,
    backgroundColor: '#EEF2F6',
    marginVertical: 13,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 9,
  },

  editButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: '#E8F2FA',
    borderWidth: 1,
    borderColor: '#1769AA',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  editIcon: {
    fontSize: 14,
    color: '#1769AA',
    marginRight: 6,
  },

  editButtonText: {
    color: '#1769AA',
    fontSize: 12,
    fontWeight: '800',
  },

  deleteButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  deleteIcon: {
    fontSize: 12,
    marginRight: 6,
  },

  deleteButtonText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '800',
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