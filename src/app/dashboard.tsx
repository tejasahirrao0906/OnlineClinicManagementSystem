import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function DashboardScreen() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      {/* Header */}
      <View style={styles.header}>

        <View>
          <Text style={styles.greeting}>
            Hello 👋
          </Text>

          <Text style={styles.name}>
            Patient
          </Text>
        </View>

        <View style={styles.profileCircle}>
          <Text style={styles.profileIcon}>
            👤
          </Text>
        </View>

      </View>

      {/* Welcome Card */}
      <View style={styles.welcomeCard}>

        <View style={styles.welcomeIconContainer}>
          <Text style={styles.welcomeIcon}>
            🏥
          </Text>
        </View>

        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeTitle}>
            Welcome to Online Clinic
          </Text>

          <Text style={styles.welcomeText}>
            Manage your healthcare services easily from one place.
          </Text>
        </View>

      </View>

      {/* Quick Services */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Quick Services
        </Text>

        <Text style={styles.sectionSubtitle}>
          Manage your healthcare
        </Text>
      </View>

      {/* Services */}
      <View style={styles.grid}>

        {/* Book Appointment */}
        <TouchableOpacity
          style={styles.serviceCard}
          onPress={() => router.push('/book-appointment')}
          activeOpacity={0.8}
        >
          <View style={styles.serviceIconContainer}>
            <Text style={styles.serviceIcon}>
              📅
            </Text>
          </View>

          <Text style={styles.serviceTitle}>
            Book Appointment
          </Text>

          <Text style={styles.serviceText}>
            Schedule a consultation
          </Text>
        </TouchableOpacity>

        {/* Appointments */}
        <TouchableOpacity
          style={styles.serviceCard}
          onPress={() => router.push('/appointments')}
          activeOpacity={0.8}
        >
          <View style={styles.serviceIconContainer}>
            <Text style={styles.serviceIcon}>
              🗓️
            </Text>
          </View>

          <Text style={styles.serviceTitle}>
            My Appointments
          </Text>

          <Text style={styles.serviceText}>
            View your upcoming visits
          </Text>
        </TouchableOpacity>

        {/* Prescriptions */}
        <TouchableOpacity
          style={styles.serviceCard}
          onPress={() => router.push('/prescriptions')}
          activeOpacity={0.8}
        >
          <View style={styles.serviceIconContainer}>
            <Text style={styles.serviceIcon}>
              💊
            </Text>
          </View>

          <Text style={styles.serviceTitle}>
            Prescriptions
          </Text>

          <Text style={styles.serviceText}>
            View your medicines
          </Text>
        </TouchableOpacity>

        {/* Bills */}
        <TouchableOpacity
          style={styles.serviceCard}
          onPress={() => router.push('/bills')}
          activeOpacity={0.8}
        >
          <View style={styles.serviceIconContainer}>
            <Text style={styles.serviceIcon}>
              🧾
            </Text>
          </View>

          <Text style={styles.serviceTitle}>
            Bills
          </Text>

          <Text style={styles.serviceText}>
            View your payments
          </Text>
        </TouchableOpacity>

      </View>

      {/* Account */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Account
        </Text>
      </View>

      <TouchableOpacity
        style={styles.accountCard}
        onPress={() => router.push('/profile')}
        activeOpacity={0.8}
      >

        <View style={styles.accountIconContainer}>
          <Text style={styles.accountIcon}>
            👤
          </Text>
        </View>

        <View style={styles.accountTextContainer}>
          <Text style={styles.accountTitle}>
            My Profile
          </Text>

          <Text style={styles.accountSubtitle}>
            View and manage your profile
          </Text>
        </View>

        <Text style={styles.arrow}>
          ›
        </Text>

      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutIcon}>
          ↪
        </Text>

        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Online Clinic • Your health, our priority
      </Text>

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
    paddingTop: 55,
    paddingBottom: 30,
  },

  /* Header */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  greeting: {
    fontSize: 15,
    color: '#667085',
    marginBottom: 3,
  },

  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1769AA',
  },

  profileCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileIcon: {
    fontSize: 27,
  },

  /* Welcome */

  welcomeCard: {
    backgroundColor: '#1769AA',
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
  },

  welcomeIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },

  welcomeIcon: {
    fontSize: 27,
  },

  welcomeContent: {
    flex: 1,
  },

  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  welcomeText: {
    color: '#E8F3FF',
    fontSize: 13,
    lineHeight: 19,
  },

  /* Section */

  sectionHeader: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#98A2B3',
    marginTop: 3,
  },

  /* Services */

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  serviceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 17,
    borderRadius: 18,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  serviceIcon: {
    fontSize: 25,
  },

  serviceTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },

  serviceText: {
    fontSize: 12,
    color: '#667085',
    lineHeight: 17,
  },

  /* Account */

  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 17,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  accountIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  accountIcon: {
    fontSize: 24,
  },

  accountTextContainer: {
    flex: 1,
  },

  accountTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  accountSubtitle: {
    fontSize: 12,
    color: '#667085',
    marginTop: 3,
  },

  arrow: {
    fontSize: 30,
    color: '#1769AA',
  },

  /* Logout */

  logoutButton: {
    marginTop: 25,
    borderWidth: 1,
    borderColor: '#E53935',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  logoutIcon: {
    color: '#E53935',
    fontSize: 18,
    marginRight: 7,
  },

  logoutText: {
    color: '#E53935',
    fontSize: 15,
    fontWeight: 'bold',
  },

  /* Footer */

  footer: {
    textAlign: 'center',
    color: '#98A2B3',
    fontSize: 11,
    marginTop: 22,
  },
});