import React, { useState } from 'react';

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
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '../firebaseConfig';

export default function AddBillScreen() {
  const {
    appointmentId,
    patientId,
    patientName,
    doctorName,
  } = useLocalSearchParams<{
    appointmentId: string;
    patientId: string;
    patientName: string;
    doctorName: string;
  }>();

  const [description, setDescription] =
    useState('');

  const [amount, setAmount] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const handleAddBill = async () => {
    if (
      !description.trim() ||
      !amount.trim()
    ) {
      Alert.alert(
        'Missing Details',
        'Please enter the bill description and amount.',
      );

      return;
    }

    if (!patientId) {
      Alert.alert(
        'Error',
        'Patient information is missing.',
      );

      return;
    }

    const numericAmount =
      Number(amount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      Alert.alert(
        'Invalid Amount',
        'Please enter a valid bill amount greater than zero.',
      );

      return;
    }

    if (!auth.currentUser) {
      Alert.alert(
        'Login Required',
        'Doctor must be logged in.',
      );

      router.replace('/doctor-login');

      return;
    }

    try {
      setSaving(true);

      await addDoc(
        collection(db, 'bills'),
        {
          appointmentId:
            appointmentId || '',
          patientId,
          patientName:
            patientName || 'Patient',
          doctorName:
            doctorName || 'Doctor',
          description:
            description.trim(),
          amount: numericAmount,
          status: 'Pending',
          date: new Date().toLocaleDateString(
            'en-IN',
          ),
          createdAt:
            serverTimestamp(),
        },
      );

      Alert.alert(
        'Bill Created',
        'The bill has been added successfully.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.back(),
          },
        ],
      );
    } catch (error) {
      console.log(
        'Add bill error:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to add bill. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.content
        }
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

          <View
            style={
              styles.headerTextContainer
            }
          >
            <Text style={styles.title}>
              Create Bill
            </Text>

            <Text style={styles.subtitle}>
              Add a bill for the selected patient
            </Text>
          </View>
        </View>

        {/* Patient / Doctor Information */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIcon}>
                ₹
              </Text>
            </View>

            <View>
              <Text
                style={styles.infoHeaderTitle}
              >
                Billing Information
              </Text>

              <Text
                style={
                  styles.infoHeaderSubtitle
                }
              >
                Linked to the current appointment
              </Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                Patient
              </Text>

              <Text
                style={styles.infoValue}
                numberOfLines={1}
              >
                {patientName || 'Patient'}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                Doctor
              </Text>

              <Text
                style={styles.infoValue}
                numberOfLines={1}
              >
                {doctorName || 'Doctor'}
              </Text>
            </View>
          </View>
        </View>

        {/* Bill Form */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>
              Bill Details
            </Text>

            <Text style={styles.requiredText}>
              * Required
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.label}>
            Bill Description
          </Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Text style={styles.inputIcon}>
                📋
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Example: Consultation Fee"
              placeholderTextColor="#9AA3B2"
              value={description}
              onChangeText={
                setDescription
              }
              editable={!saving}
              autoCapitalize="sentences"
            />
          </View>

          <Text style={styles.helperText}>
            Describe the service or charge included
            in this bill.
          </Text>

          {/* Amount */}
          <Text style={styles.label}>
            Amount
          </Text>

          <View style={styles.amountContainer}>
            <View
              style={styles.currencyBox}
            >
              <Text
                style={styles.currencyText}
              >
                ₹
              </Text>
            </View>

            <TextInput
              style={styles.amountInput}
              placeholder="Enter amount"
              placeholderTextColor="#9AA3B2"
              value={amount}
              onChangeText={setAmount}
              editable={!saving}
              keyboardType="decimal-pad"
            />
          </View>

          <Text style={styles.helperText}>
            Enter the bill amount in Indian Rupees.
          </Text>

          {/* Preview */}
          {amount.trim() !== '' &&
            !Number.isNaN(
              Number(amount),
            ) &&
            Number(amount) > 0 && (
              <View
                style={
                  styles.previewCard
                }
              >
                <View>
                  <Text
                    style={
                      styles.previewLabel
                    }
                  >
                    Bill Total
                  </Text>

                  <Text
                    style={
                      styles.previewSubtext
                    }
                  >
                    Payment status: Pending
                  </Text>
                </View>

                <Text
                  style={
                    styles.previewAmount
                  }
                >
                  ₹
                  {Number(amount).toFixed(
                    2,
                  )}
                </Text>
              </View>
            )}

          {/* Create Bill Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              saving &&
                styles.disabledButton,
            ]}
            onPress={handleAddBill}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  Creating Bill...
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={
                    styles.saveButtonIcon
                  }
                >
                  ✓
                </Text>

                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  Create Bill
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Information Note */}
        <View style={styles.noteCard}>
          <View style={styles.noteIconCircle}>
            <Text style={styles.noteIcon}>
              ℹ
            </Text>
          </View>

          <View style={styles.noteContent}>
            <Text style={styles.noteTitle}>
              Payment Status
            </Text>

            <Text style={styles.noteText}>
              New bills are created with Pending
              status. The patient can view the bill
              from their Bills section.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FC',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
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
    fontSize: 25,
    fontWeight: '800',
    color: '#1769AA',
  },

  subtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 3,
  },

  infoCard: {
    backgroundColor: '#16A34A',
    borderRadius: 20,
    padding: 17,
    marginBottom: 18,
  },

  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor:
      'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  infoIcon: {
    fontSize: 23,
    color: '#FFFFFF',
    fontWeight: '800',
  },

  infoHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  infoHeaderSubtitle: {
    fontSize: 11,
    color: '#E5FBEA',
    marginTop: 3,
  },

  infoDivider: {
    height: 1,
    backgroundColor:
      'rgba(255,255,255,0.20)',
    marginVertical: 15,
  },

  infoRow: {
    flexDirection: 'row',
    gap: 15,
  },

  infoItem: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 10,
    color: '#DCFCE7',
    fontWeight: '600',
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },

  requiredText: {
    fontSize: 10,
    color: '#DC3545',
    fontWeight: '600',
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 17,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5DDE5',
    borderRadius: 12,
    backgroundColor: '#FAFCFE',
    minHeight: 50,
  },

  inputIconBox: {
    width: 43,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },

  inputIcon: {
    fontSize: 17,
  },

  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#222',
  },

  helperText: {
    fontSize: 10,
    color: '#8A94A6',
    lineHeight: 16,
    marginTop: 7,
  },

  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5DDE5',
    borderRadius: 12,
    backgroundColor: '#FAFCFE',
    minHeight: 52,
  },

  currencyBox: {
    width: 45,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF3',
    borderRightWidth: 1,
    borderRightColor: '#D5EEDC',
    borderTopLeftRadius: 11,
    borderBottomLeftRadius: 11,
  },

  currencyText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#16A34A',
  },

  amountInput: {
    flex: 1,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
  },

  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 13,
    padding: 13,
    marginTop: 16,
  },

  previewLabel: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '700',
  },

  previewSubtext: {
    fontSize: 10,
    color: '#65A30D',
    marginTop: 3,
  },

  previewAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#15803D',
  },

  saveButton: {
    backgroundColor: '#16A34A',
    minHeight: 51,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 24,
  },

  disabledButton: {
    backgroundColor: '#86C99B',
  },

  saveButtonIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 13,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E5EAF0',
  },

  noteIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  noteIcon: {
    fontSize: 16,
    color: '#1769AA',
    fontWeight: '800',
  },

  noteContent: {
    flex: 1,
  },

  noteTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 3,
  },

  noteText: {
    fontSize: 11,
    color: '#718096',
    lineHeight: 17,
  },
});