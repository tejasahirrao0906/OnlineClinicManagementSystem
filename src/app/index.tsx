import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logo}>🏥</Text>
        </View>

        <Text style={styles.title}>
          Online Clinic
        </Text>

        <Text style={styles.subtitle}>
          Your health, our priority
        </Text>
      </View>

      {/* Main Card */}
      <View style={styles.card}>

        <Text style={styles.welcome}>
          Welcome!
        </Text>

        <Text style={styles.description}>
          Manage your healthcare easily. Book appointments,
          view prescriptions, and access your bills from one
          place.
        </Text>

        {/* Patient */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            👤  Patient Login
          </Text>
        </TouchableOpacity>

        {/* Doctor */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/doctor-login')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>
            👨‍⚕️  Doctor Login
          </Text>
        </TouchableOpacity>

        {/* Admin */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/admin-login')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>
            👨‍💼  Admin Login
          </Text>
        </TouchableOpacity>

      </View>

      {/* Features */}
      <View style={styles.features}>

        <View style={styles.feature}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.icon}>📅</Text>
          </View>

          <Text style={styles.featureText}>
            Appointments
          </Text>
        </View>

        <View style={styles.feature}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.icon}>💊</Text>
          </View>

          <Text style={styles.featureText}>
            Prescriptions
          </Text>
        </View>

        <View style={styles.feature}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.icon}>🧾</Text>
          </View>

          <Text style={styles.featureText}>
            Bills
          </Text>
        </View>

      </View>

      <Text style={styles.footer}>
        Secure • Simple • Convenient
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FC',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 25,
    justifyContent: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logoCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  logo: {
    fontSize: 45,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1769AA',
    letterSpacing: 0.3,
  },

  subtitle: {
    fontSize: 15,
    color: '#667085',
    marginTop: 6,
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  welcome: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },

  description: {
    fontSize: 15,
    lineHeight: 23,
    color: '#667085',
    marginBottom: 24,
  },

  primaryButton: {
    backgroundColor: '#1769AA',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  secondaryButton: {
    backgroundColor: '#F8FBFD',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#B9D5E8',
  },

  secondaryButtonText: {
    color: '#1769AA',
    fontSize: 16,
    fontWeight: 'bold',
  },

  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
  },

  feature: {
    alignItems: 'center',
    flex: 1,
  },

  featureIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    marginBottom: 7,
  },

  icon: {
    fontSize: 25,
  },

  featureText: {
    fontSize: 12,
    color: '#667085',
    textAlign: 'center',
    fontWeight: '500',
  },

  footer: {
    textAlign: 'center',
    color: '#98A2B3',
    fontSize: 12,
    marginTop: 22,
  },
});