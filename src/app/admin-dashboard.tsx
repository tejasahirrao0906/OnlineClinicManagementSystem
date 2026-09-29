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

import { auth, db } from '../firebaseConfig';

export default function AdminDashboardScreen() {
  const [totalPatients, setTotalPatients] =
    useState(0);

  const [totalDoctors, setTotalDoctors] =
    useState(0);

  const [totalAppointments, setTotalAppointments] =
    useState(0);

  const [totalBills, setTotalBills] =
    useState(0);

  const [
    confirmedAppointments,
    setConfirmedAppointments,
  ] = useState(0);

  const [
    completedAppointments,
    setCompletedAppointments,
  ] = useState(0);

  const [
    cancelledAppointments,
    setCancelledAppointments,
  ] = useState(0);

  const [checkingAdmin, setCheckingAdmin] =
    useState(true);

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  // ==========================================
  // ADMIN ACCESS VERIFICATION
  // ==========================================

  useEffect(() => {
    const checkAdminAccess = async () => {
      const user = auth.currentUser;

      if (!user) {
        setCheckingAdmin(false);

        router.replace('/admin-login');

        return;
      }

      try {
        const adminRef = doc(
          db,
          'adminUsers',
          user.uid,
        );

        const adminSnapshot =
          await getDoc(adminRef);

        if (!adminSnapshot.exists()) {
          setIsAdmin(false);
          setCheckingAdmin(false);

          await auth.signOut();

          Alert.alert(
            'Access Denied',
            'You are not authorized to access the Admin Dashboard.',
          );

          router.replace('/admin-login');

          return;
        }

        const adminData =
          adminSnapshot.data();

        if (
          adminData.role !== 'admin'
        ) {
          setIsAdmin(false);
          setCheckingAdmin(false);

          await auth.signOut();

          Alert.alert(
            'Access Denied',
            'You do not have administrator access.',
          );

          router.replace('/admin-login');

          return;
        }

        setIsAdmin(true);
        setCheckingAdmin(false);
      } catch (error) {
        console.log(
          'Admin verification error:',
          error,
        );

        setIsAdmin(false);
        setCheckingAdmin(false);

        Alert.alert(
          'Error',
          'Unable to verify administrator access.',
        );

        router.replace('/admin-login');
      }
    };

    checkAdminAccess();
  }, [checkingAdmin, isAdmin]);

  // ==========================================
  // LOAD DASHBOARD STATISTICS
  // ==========================================

  useEffect(() => {
  // Do not start Firestore listeners until
  // admin authentication has been fully verified.
  if (checkingAdmin || !isAdmin) {
    return;
  }

  console.log('Admin verified. Starting Firestore listeners...');

  const unsubscribeUsers = onSnapshot(
    collection(db, 'users'),
    (snapshot) => {
      setTotalPatients(snapshot.size);
    },
    (error) => {
      console.log('Patients loading error:', error);
    },
  );

  const unsubscribeDoctors = onSnapshot(
    collection(db, 'doctors'),
    (snapshot) => {
      setTotalDoctors(snapshot.size);
    },
    (error) => {
      console.log('Doctors loading error:', error);
    },
  );

  const unsubscribeAppointments = onSnapshot(
    collection(db, 'appointments'),
    (snapshot) => {
      setTotalAppointments(snapshot.size);
    },
    (error) => {
      console.log('Appointments loading error:', error);
    },
  );

  const unsubscribeBills = onSnapshot(
    collection(db, 'bills'),
    (snapshot) => {
      setTotalBills(snapshot.size);
    },
    (error) => {
      console.log('Bills loading error:', error);
    },
  );

  return () => {
    unsubscribeUsers();
    unsubscribeDoctors();
    unsubscribeAppointments();
    unsubscribeBills();
  };
}, [checkingAdmin, isAdmin]);

  // ==========================================
  // ADMIN LOGOUT
  // ==========================================

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from the Admin Dashboard?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoggingOut(true);

              await auth.signOut();

              router.replace(
                '/admin-login',
              );
            } catch (error) {
              console.log(
                'Admin logout error:',
                error,
              );

              setLoggingOut(false);

              Alert.alert(
                'Error',
                'Unable to logout. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  // ==========================================
  // CHECKING ADMIN ACCESS
  // ==========================================

  if (checkingAdmin) {
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
          Verifying Administrator Access
        </Text>

        <Text
          style={
            styles.loadingText
          }
        >
          Please wait while we securely
          verify your account.
        </Text>
      </View>
    );
  }

  // ==========================================
  // NOT ADMIN
  // ==========================================

  if (!isAdmin) {
    return null;
  }

  // ==========================================
  // ADMIN DASHBOARD UI
  // ==========================================

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
          <View
            style={
              styles.headerTopRow
            }
          >
            <View
              style={
                styles.adminIconCircle
              }
            >
              <Text
                style={
                  styles.adminIcon
                }
              >
                🔐
              </Text>
            </View>

            <View
              style={
                styles.headerTextContainer
              }
            >
              <Text
                style={
                  styles.welcomeText
                }
              >
                Welcome, Admin
              </Text>

              <Text
                style={
                  styles.headerSubtitle
                }
              >
                Clinic Administration
              </Text>
            </View>

            <View
              style={
                styles.liveBadge
              }
            >
              <View
                style={
                  styles.liveDot
                }
              />

              <Text
                style={
                  styles.liveText
                }
              >
                LIVE
              </Text>
            </View>
          </View>

          <Text
            style={styles.title}
          >
            Admin Dashboard
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Overview and management of the
            Online Clinic Management System
          </Text>
        </View>

        {/* Main Statistics */}
        <View
          style={
            styles.sectionHeader
          }
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Clinic Overview
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Current system statistics
            </Text>
          </View>
        </View>

        <View
          style={styles.grid}
        >
          {/* Patients */}
          <View
            style={[
              styles.statCard,
              styles.blueCard,
            ]}
          >
            <View
              style={
                styles.statIconCircle
              }
            >
              <Text
                style={
                  styles.statIcon
                }
              >
                👥
              </Text>
            </View>

            <Text
              style={
                styles.statNumber
              }
            >
              {totalPatients}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Total Patients
            </Text>
          </View>

          {/* Doctors */}
          <View
            style={[
              styles.statCard,
              styles.greenCard,
            ]}
          >
            <View
              style={
                styles.statIconCircle
              }
            >
              <Text
                style={
                  styles.statIcon
                }
              >
                👨‍⚕️
              </Text>
            </View>

            <Text
              style={
                styles.statNumber
              }
            >
              {totalDoctors}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Total Doctors
            </Text>
          </View>

          {/* Appointments */}
          <View
            style={[
              styles.statCard,
              styles.orangeCard,
            ]}
          >
            <View
              style={
                styles.statIconCircle
              }
            >
              <Text
                style={
                  styles.statIcon
                }
              >
                📅
              </Text>
            </View>

            <Text
              style={
                styles.statNumber
              }
            >
              {totalAppointments}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Appointments
            </Text>
          </View>

          {/* Bills */}
          <View
            style={[
              styles.statCard,
              styles.purpleCard,
            ]}
          >
            <View
              style={
                styles.statIconCircle
              }
            >
              <Text
                style={
                  styles.statIcon
                }
              >
                💳
              </Text>
            </View>

            <Text
              style={
                styles.statNumber
              }
            >
              {totalBills}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Total Bills
            </Text>
          </View>
        </View>

        {/* Appointment Status */}
        <View
          style={
            styles.sectionHeader
          }
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Appointment Status
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Current appointment breakdown
            </Text>
          </View>
        </View>

        <View
          style={
            styles.statusContainer
          }
        >
          {/* Confirmed */}
          <View
            style={
              styles.statusCard
            }
          >
            <View
              style={[
                styles.statusIconCircle,
                styles.confirmedIcon,
              ]}
            >
              <Text
                style={
                  styles.statusIcon
                }
              >
                ✓
              </Text>
            </View>

            <Text
              style={
                styles.statusNumber
              }
            >
              {confirmedAppointments}
            </Text>

            <Text
              style={
                styles.statusLabel
              }
            >
              Confirmed
            </Text>
          </View>

          {/* Completed */}
          <View
            style={
              styles.statusCard
            }
          >
            <View
              style={[
                styles.statusIconCircle,
                styles.completedIcon,
              ]}
            >
              <Text
                style={
                  styles.statusIcon
                }
              >
                ✓
              </Text>
            </View>

            <Text
              style={
                styles.statusNumber
              }
            >
              {completedAppointments}
            </Text>

            <Text
              style={
                styles.statusLabel
              }
            >
              Completed
            </Text>
          </View>

          {/* Cancelled */}
          <View
            style={
              styles.statusCard
            }
          >
            <View
              style={[
                styles.statusIconCircle,
                styles.cancelledIcon,
              ]}
            >
              <Text
                style={
                  styles.statusIcon
                }
              >
                ×
              </Text>
            </View>

            <Text
              style={
                styles.statusNumber
              }
            >
              {cancelledAppointments}
            </Text>

            <Text
              style={
                styles.statusLabel
              }
            >
              Cancelled
            </Text>
          </View>
        </View>

        {/* Admin Actions */}
        <View
          style={
            styles.actionsHeader
          }
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Management
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Manage clinic records and services
            </Text>
          </View>
        </View>

        {/* Doctor Dashboard */}
        <TouchableOpacity
          style={
            styles.actionCard
          }
          onPress={() =>
            router.push(
              '/doctor-dashboard',
            )
          }
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.actionIconCircle,
              styles.doctorActionIcon,
            ]}
          >
            <Text
              style={
                styles.actionIcon
              }
            >
              👨‍⚕️
            </Text>
          </View>

          <View
            style={
              styles.actionContent
            }
          >
            <Text
              style={
                styles.actionTitle
              }
            >
              Doctor Dashboard
            </Text>

            <Text
              style={
                styles.actionSubtitle
              }
            >
              View doctor-side dashboard
            </Text>
          </View>

          <Text
            style={
              styles.actionArrow
            }
          >
            ›
          </Text>
        </TouchableOpacity>

        {/* Manage Doctors */}
        <TouchableOpacity
          style={
            styles.actionCard
          }
          onPress={() =>
            router.push(
              '/manage-doctors',
            )
          }
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.actionIconCircle,
              styles.doctorActionIcon,
            ]}
          >
            <Text
              style={
                styles.actionIcon
              }
            >
              🩺
            </Text>
          </View>

          <View
            style={
              styles.actionContent
            }
          >
            <Text
              style={
                styles.actionTitle
              }
            >
              Manage Doctors
            </Text>

            <Text
              style={
                styles.actionSubtitle
              }
            >
              Add, edit, and remove doctors
            </Text>
          </View>

          <Text
            style={
              styles.actionArrow
            }
          >
            ›
          </Text>
        </TouchableOpacity>

        {/* Manage Patients */}
        <TouchableOpacity
          style={
            styles.actionCard
          }
          onPress={() =>
            router.push(
              '/manage-patients',
            )
          }
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.actionIconCircle,
              styles.patientActionIcon,
            ]}
          >
            <Text
              style={
                styles.actionIcon
              }
            >
              👥
            </Text>
          </View>

          <View
            style={
              styles.actionContent
            }
          >
            <Text
              style={
                styles.actionTitle
              }
            >
              Manage Patients
            </Text>

            <Text
              style={
                styles.actionSubtitle
              }
            >
              View registered patient records
            </Text>
          </View>

          <Text
            style={
              styles.actionArrow
            }
          >
            ›
          </Text>
        </TouchableOpacity>

        {/* Manage Appointments */}
        <TouchableOpacity
          style={
            styles.actionCard
          }
          onPress={() =>
            router.push(
              '/manage-appointments',
            )
          }
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.actionIconCircle,
              styles.appointmentActionIcon,
            ]}
          >
            <Text
              style={
                styles.actionIcon
              }
            >
              📅
            </Text>
          </View>

          <View
            style={
              styles.actionContent
            }
          >
            <Text
              style={
                styles.actionTitle
              }
            >
              Manage Appointments
            </Text>

            <Text
              style={
                styles.actionSubtitle
              }
            >
              View and monitor appointments
            </Text>
          </View>

          <Text
            style={
              styles.actionArrow
            }
          >
            ›
          </Text>
        </TouchableOpacity>

        {/* Manage Bills */}
        <TouchableOpacity
          style={
            styles.actionCard
          }
          onPress={() =>
            router.push(
              '/manage-bills',
            )
          }
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.actionIconCircle,
              styles.billActionIcon,
            ]}
          >
            <Text
              style={
                styles.actionIcon
              }
            >
              💳
            </Text>
          </View>

          <View
            style={
              styles.actionContent
            }
          >
            <Text
              style={
                styles.actionTitle
              }
            >
              Manage Bills
            </Text>

            <Text
              style={
                styles.actionSubtitle
              }
            >
              View and monitor patient bills
            </Text>
          </View>

          <Text
            style={
              styles.actionArrow
            }
          >
            ›
          </Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={
            styles.logoutButton
          }
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.8}
        >
          {loggingOut ? (
            <>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.logoutText
                }
              >
                Logging Out...
              </Text>
            </>
          ) : (
            <>
              <Text
                style={
                  styles.logoutIcon
                }
              >
                ⇥
              </Text>

              <Text
                style={
                  styles.logoutText
                }
              >
                Logout
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Footer */}
        <View
          style={
            styles.footer
          }
        >
          <Text
            style={
              styles.footerIcon
            }
          >
            🏥
          </Text>

          <Text
            style={
              styles.footerText
            }
          >
            Online Clinic Management System
          </Text>

          <Text
            style={
              styles.footerLive
            }
          >
            • Live Data
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

  // ==================================
  // LOADING
  // ==================================

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F9FC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  loadingCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F2FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  loadingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },

  loadingText: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 20,
  },

  // ==================================
  // HEADER
  // ==================================

  header: {
    marginBottom: 22,
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  adminIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  adminIcon: {
    fontSize: 24,
  },

  headerTextContainer: {
    flex: 1,
  },

  welcomeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },

  headerSubtitle: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
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

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#1769AA',
  },

  subtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 5,
    lineHeight: 19,
  },

  // ==================================
  // SECTION HEADERS
  // ==================================

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
    fontSize: 11,
    color: '#8A94A6',
    marginTop: 3,
  },

  // ==================================
  // MAIN STATISTICS
  // ==================================

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  blueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#1769AA',
  },

  greenCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
  },

  orangeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EA580C',
  },

  purpleCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
  },

  statIconCircle: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#F5F9FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  statIcon: {
    fontSize: 22,
  },

  statNumber: {
    fontSize: 27,
    fontWeight: '800',
    color: '#1769AA',
  },

  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  // ==================================
  // APPOINTMENT STATUS
  // ==================================

  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 23,
  },

  statusCard: {
    width: '31.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  statusIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  confirmedIcon: {
    backgroundColor: '#FEF3C7',
  },

  completedIcon: {
    backgroundColor: '#DCFCE7',
  },

  cancelledIcon: {
    backgroundColor: '#FEE2E2',
  },

  statusIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#374151',
  },

  statusNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1769AA',
  },

  statusLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    textAlign: 'center',
  },

  // ==================================
  // MANAGEMENT ACTIONS
  // ==================================

  actionsHeader: {
    marginBottom: 12,
  },

  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  actionIconCircle: {
    width: 47,
    height: 47,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  doctorActionIcon: {
    backgroundColor: '#E8F2FA',
  },

  patientActionIcon: {
    backgroundColor: '#ECFDF3',
  },

  appointmentActionIcon: {
    backgroundColor: '#FFF7ED',
  },

  billActionIcon: {
    backgroundColor: '#F5F3FF',
  },

  actionIcon: {
    fontSize: 22,
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
  },

  actionSubtitle: {
    fontSize: 11,
    color: '#8A94A6',
    marginTop: 3,
  },

  actionArrow: {
    fontSize: 28,
    color: '#9AA3B2',
    marginLeft: 8,
  },

  // ==================================
  // LOGOUT
  // ==================================

  logoutButton: {
    minHeight: 49,
    borderRadius: 12,
    backgroundColor: '#DC3545',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },

  logoutIcon: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    marginRight: 8,
  },

  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // ==================================
  // FOOTER
  // ==================================

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },

  footerIcon: {
    fontSize: 13,
    marginRight: 5,
  },

  footerText: {
    fontSize: 10,
    color: '#8A94A6',
  },

  footerLive: {
    fontSize: 10,
    color: '#16A34A',
    marginLeft: 5,
    fontWeight: '600',
  },
});