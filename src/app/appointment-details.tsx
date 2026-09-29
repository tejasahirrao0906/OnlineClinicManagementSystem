import React from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

export default function AppointmentDetailsScreen() {
  const params = useLocalSearchParams();

  const doctorName = String(params.doctorName || 'Unknown Doctor');
  const specialization = String(
    params.specialization || 'General Physician'
  );
  const date = String(params.date || '');
  const time = String(params.time || '');
  const reason = String(params.reason || '');
  const status = String(params.status || 'Confirmed');
  const appointmentId = String(params.appointmentId || '');

  const isCancelled = status === 'Cancelled';
  const isCompleted = status === 'Completed';

  const getStatusColor = () => {
    if (isCancelled) {
      return {
        background: '#FDECEC',
        text: '#C62828',
        icon: '✕',
      };
    }

    if (isCompleted) {
      return {
        background: '#E8F5E9',
        text: '#2E7D32',
        icon: '✓',
      };
    }

    return {
      background: '#E8F2FA',
      text: '#1769AA',
      icon: '✓',
    };
  };

  const statusStyle = getStatusColor();

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
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Appointment Details</Text>

        <Text style={styles.subtitle}>
          Review your consultation information
        </Text>
      </View>

      {/* Status Banner */}
      <View
        style={[
          styles.statusBanner,
          { backgroundColor: statusStyle.background },
        ]}
      >
        <View
          style={[
            styles.statusIconContainer,
            { backgroundColor: '#FFFFFF' },
          ]}
        >
          <Text
            style={[
              styles.statusIcon,
              { color: statusStyle.text },
            ]}
          >
            {statusStyle.icon}
          </Text>
        </View>

        <View style={styles.statusBannerInfo}>
          <Text style={styles.statusBannerLabel}>
            Appointment Status
          </Text>

          <Text
            style={[
              styles.statusBannerStatus,
              { color: statusStyle.text },
            ]}
          >
            {status}
          </Text>
        </View>
      </View>

      {/* Doctor Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Doctor</Text>

        <View style={styles.doctorContainer}>
          <View style={styles.doctorAvatar}>
            <Text style={styles.doctorAvatarText}>👨‍⚕️</Text>
          </View>

          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>
              {doctorName}
            </Text>

            <Text style={styles.specialization}>
              {specialization}
            </Text>
          </View>
        </View>
      </View>

      {/* Appointment Information */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Appointment Information
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoIcon}>📅</Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>
              {date || 'Not available'}
            </Text>
          </View>
        </View>

        <View style={styles.infoDivider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoIcon}>⏰</Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>
              {time || 'Not available'}
            </Text>
          </View>
        </View>

        <View style={styles.infoDivider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoIcon}>📝</Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>
              Reason for Visit
            </Text>

            <Text style={styles.infoValue}>
              {reason || 'No reason provided'}
            </Text>
          </View>
        </View>
      </View>

      {/* Appointment ID */}
      <View style={styles.idCard}>
        <View style={styles.idHeader}>
          <Text style={styles.idIcon}>🆔</Text>

          <Text style={styles.idTitle}>
            Appointment ID
          </Text>
        </View>

        <Text style={styles.idValue}>
          {appointmentId || 'Not available'}
        </Text>
      </View>

      {/* Status Message */}
      {isCancelled && (
        <View
          style={[
            styles.messageCard,
            styles.cancelledMessage,
          ]}
        >
          <View style={styles.messageIconCircle}>
            <Text style={styles.cancelledMessageIcon}>
              ✕
            </Text>
          </View>

          <Text style={styles.messageTitle}>
            Appointment Cancelled
          </Text>

          <Text style={styles.messageText}>
            This appointment is no longer active. You can book
            another appointment whenever you need.
          </Text>
        </View>
      )}

      {isCompleted && (
        <View
          style={[
            styles.messageCard,
            styles.completedMessage,
          ]}
        >
          <View style={styles.messageIconCircle}>
            <Text style={styles.completedMessageIcon}>
              ✓
            </Text>
          </View>

          <Text style={styles.messageTitle}>
            Consultation Completed
          </Text>

          <Text style={styles.messageText}>
            Your consultation has been completed successfully.
            You can view your prescription or bill from the
            respective sections.
          </Text>
        </View>
      )}

      {!isCancelled && !isCompleted && (
        <View
          style={[
            styles.messageCard,
            styles.confirmedMessage,
          ]}
        >
          <View style={styles.messageIconCircle}>
            <Text style={styles.confirmedMessageIcon}>
              ✓
            </Text>
          </View>

          <Text style={styles.messageTitle}>
            Appointment Confirmed
          </Text>

          <Text style={styles.messageText}>
            Please arrive a few minutes before your scheduled
            appointment time.
          </Text>
        </View>
      )}

      {/* Bottom Button */}
      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => router.back()}
        activeOpacity={0.85}
      >
        <Text style={styles.doneButtonText}>
          Done
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
    marginBottom: 18,
  },

  backArrow: {
    fontSize: 30,
    lineHeight: 30,
    color: '#1769AA',
    marginRight: 5,
    marginTop: -2,
  },

  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1769AA',
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#153B56',
  },

  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 6,
  },

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },

  statusIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  statusIcon: {
    fontSize: 20,
    fontWeight: '800',
  },

  statusBannerInfo: {
    flex: 1,
  },

  statusBannerLabel: {
    fontSize: 12,
    color: '#667085',
    marginBottom: 3,
  },

  statusBannerStatus: {
    fontSize: 17,
    fontWeight: '800',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
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

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#153B56',
    marginBottom: 16,
  },

  doctorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  doctorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  doctorAvatarText: {
    fontSize: 34,
  },

  doctorInfo: {
    flex: 1,
  },

  doctorName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#222222',
  },

  specialization: {
    fontSize: 14,
    color: '#1769AA',
    fontWeight: '600',
    marginTop: 5,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 55,
  },

  infoIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F0F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  infoIcon: {
    fontSize: 20,
  },

  infoContent: {
    flex: 1,
    paddingTop: 2,
  },

  infoLabel: {
    fontSize: 12,
    color: '#8A94A6',
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 15,
    color: '#263238',
    fontWeight: '600',
    lineHeight: 21,
  },

  infoDivider: {
    height: 1,
    backgroundColor: '#EEF1F4',
    marginVertical: 13,
    marginLeft: 55,
  },

  idCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5EDF3',
  },

  idHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  idIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  idTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#667085',
  },

  idValue: {
    fontSize: 12,
    color: '#344054',
    lineHeight: 18,
  },

  messageCard: {
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginBottom: 18,
  },

  confirmedMessage: {
    backgroundColor: '#EAF4FB',
  },

  completedMessage: {
    backgroundColor: '#EAF7EC',
  },

  cancelledMessage: {
    backgroundColor: '#FDEEEE',
  },

  messageIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  confirmedMessageIcon: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1769AA',
  },

  completedMessageIcon: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E7D32',
  },

  cancelledMessageIcon: {
    fontSize: 22,
    fontWeight: '800',
    color: '#C62828',
  },

  messageTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#25313C',
    textAlign: 'center',
  },

  messageText: {
    fontSize: 13,
    color: '#667085',
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 20,
  },

  doneButton: {
    backgroundColor: '#1769AA',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});