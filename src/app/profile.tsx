import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

import { auth, db } from '../firebaseConfig';

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        Alert.alert(
          'Login Required',
          'Please login to view your profile.'
        );

        setLoading(false);
        return;
      }

      setEmail(user.email || '');

      const userRef = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();

        setName(userData.name || '');
        setPhone(userData.phone || '');
        setAddress(userData.address || '');
      }
    } catch (error) {
      console.log(
        'Profile loading error:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to load your profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login before saving your profile.'
      );
      return;
    }

    if (name.trim() === '') {
      Alert.alert(
        'Missing Name',
        'Please enter your name.'
      );
      return;
    }

    if (phone.trim() === '') {
      Alert.alert(
        'Missing Phone Number',
        'Please enter your phone number.'
      );
      return;
    }

    setSaving(true);

    try {
      const userRef = doc(db, 'users', user.uid);

      await setDoc(
        userRef,
        {
          name: name.trim(),
          email: user.email || '',
          phone: phone.trim(),
          address: address.trim(),
          updatedAt: new Date(),
        },
        {
          merge: true,
        }
      );

      Alert.alert(
        'Profile Updated',
        'Your profile has been saved successfully.'
      );
    } catch (error) {
      console.log(
        'Profile saving error:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to save your profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Text style={styles.loadingIconText}>
            👤
          </Text>
        </View>

        <ActivityIndicator
          size="large"
          color="#1769AA"
        />

        <Text style={styles.loadingText}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              👤
            </Text>
          </View>

          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              My Profile
            </Text>

            <Text style={styles.subtitle}>
              Manage your personal information
            </Text>
          </View>
        </View>

        {/* Profile Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>
                Personal Information
              </Text>

              <Text style={styles.cardSubtitle}>
                Keep your details up to date
              </Text>
            </View>

            <View style={styles.cardHeaderIcon}>
              <Text style={styles.cardHeaderIconText}>
                ✎
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Email Address
            </Text>

            <View
              style={[
                styles.inputWrapper,
                styles.disabledInputWrapper,
              ]}
            >
              <Text style={styles.inputIcon}>
                ✉
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.disabledInput,
                ]}
                value={email}
                editable={false}
                placeholder="Email address"
                placeholderTextColor="#98A2B3"
              />
            </View>

            <Text style={styles.helperText}>
              Email address cannot be changed here.
            </Text>
          </View>

          {/* Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Full Name
              <Text style={styles.required}> *</Text>
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>
                👤
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#98A2B3"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Phone Number
              <Text style={styles.required}> *</Text>
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>
                ☎
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#98A2B3"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Address */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Address
            </Text>

            <View
              style={[
                styles.inputWrapper,
                styles.addressWrapper,
              ]}
            >
              <Text style={styles.inputIcon}>
                📍
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.addressInput,
                ]}
                placeholder="Enter your address"
                placeholderTextColor="#98A2B3"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              saving && styles.disabledButton,
            ]}
            onPress={saveProfile}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text style={styles.saveButtonText}>
                  Saving...
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.saveButtonIcon}>
                  ✓
                </Text>

                <Text style={styles.saveButtonText}>
                  Save Profile
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Privacy / Information Note */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconCircle}>
            <Text style={styles.infoIcon}>
              🔒
            </Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Your information is secure
            </Text>

            <Text style={styles.infoText}>
              Your profile information is used to manage
              your appointments and clinic records.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F9FC',
  },

  container: {
    flexGrow: 1,
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
    fontSize: 14,
    color: '#667085',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  profileAvatarText: {
    fontSize: 30,
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#153B56',
  },

  subtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 4,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
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
    justifyContent: 'space-between',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#153B56',
  },

  cardSubtitle: {
    fontSize: 12,
    color: '#8A94A6',
    marginTop: 3,
  },

  cardHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardHeaderIconText: {
    fontSize: 19,
    color: '#1769AA',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF1F4',
    marginVertical: 18,
  },

  fieldContainer: {
    marginBottom: 17,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#344054',
    marginBottom: 7,
  },

  required: {
    color: '#C62828',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#D8E0E7',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },

  disabledInputWrapper: {
    backgroundColor: '#F3F6F8',
    borderColor: '#E2E8EE',
  },

  inputIcon: {
    width: 28,
    fontSize: 17,
    color: '#667085',
    textAlign: 'center',
    marginRight: 7,
  },

  input: {
    flex: 1,
    minHeight: 48,
    fontSize: 15,
    color: '#263238',
    paddingVertical: 10,
  },

  disabledInput: {
    color: '#667085',
  },

  helperText: {
    fontSize: 11,
    color: '#98A2B3',
    marginTop: 5,
    marginLeft: 2,
  },

  addressWrapper: {
    alignItems: 'flex-start',
    minHeight: 110,
    paddingTop: 8,
  },

  addressInput: {
    minHeight: 95,
    paddingTop: 8,
  },

  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: '#1769AA',
    borderRadius: 14,
    marginTop: 6,
  },

  disabledButton: {
    opacity: 0.7,
  },

  saveButtonIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 7,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EAF4FB',
    borderRadius: 16,
    padding: 15,
    marginTop: 16,
  },

  infoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  infoIcon: {
    fontSize: 17,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#153B56',
    marginBottom: 3,
  },

  infoText: {
    fontSize: 12,
    color: '#667085',
    lineHeight: 18,
  },
});