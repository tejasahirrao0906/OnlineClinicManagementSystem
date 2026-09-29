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

type Bill = {
  id: string;
  doctorName: string;
  date: string;
  amount: number;
  status: string;
  description: string;
};

export default function BillsScreen() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert(
        'Login Required',
        'Please login to view your bills.'
      );

      router.replace('/login');
      return;
    }

    const billsQuery = query(
      collection(db, 'bills'),
      where('patientId', '==', currentUser.uid),
    );

    const unsubscribe = onSnapshot(
      billsQuery,
      (snapshot) => {
        const billList: Bill[] = snapshot.docs.map(
          (document) => {
            const data = document.data();

            return {
              id: document.id,
              doctorName:
                data.doctorName || 'Unknown Doctor',
              date:
                data.date || 'Date not available',
              amount: data.amount || 0,
              status: data.status || 'Pending',
              description:
                data.description || 'Medical Service',
            };
          }
        );

        setBills(billList);
        setLoading(false);
      },
      (error) => {
        console.log('Bills loading error:', error);
        setLoading(false);

        Alert.alert(
          'Error',
          'Unable to load bills. Please try again.'
        );
      },
    );

    return unsubscribe;
  }, []);

  const handlePayment = (billId: string) => {
    Alert.alert(
      'Payment Feature',
      `Payment option for bill ${billId} will be added later.`,
    );
  };

  const paidBills = bills.filter(
    (bill) => bill.status === 'Paid'
  );

  const pendingBills = bills.filter(
    (bill) => bill.status !== 'Paid'
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>🧾</Text>
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>My Bills</Text>

          <Text style={styles.subtitle}>
            View your consultation bills and payment status.
          </Text>
        </View>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingCard}>
          <ActivityIndicator
            size="large"
            color="#1769AA"
          />

          <Text style={styles.loadingText}>
            Loading bills...
          </Text>
        </View>
      )}

      {/* Summary */}
      {!loading && bills.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <View style={styles.summaryIcon}>
              <Text style={styles.summaryIconText}>🧾</Text>
            </View>

            <View>
              <Text style={styles.summaryNumber}>
                {bills.length}
              </Text>

              <Text style={styles.summaryLabel}>
                Total Bills
              </Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <View
              style={[
                styles.summaryIcon,
                styles.paidSummaryIcon,
              ]}
            >
              <Text style={styles.summaryIconText}>✓</Text>
            </View>

            <View>
              <Text style={styles.summaryNumber}>
                {paidBills.length}
              </Text>

              <Text style={styles.summaryLabel}>
                Paid
              </Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <View
              style={[
                styles.summaryIcon,
                styles.pendingSummaryIcon,
              ]}
            >
              <Text style={styles.summaryIconText}>!</Text>
            </View>

            <View>
              <Text style={styles.summaryNumber}>
                {pendingBills.length}
              </Text>

              <Text style={styles.summaryLabel}>
                Pending
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Empty State */}
      {!loading && bills.length === 0 && (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIcon}>🧾</Text>
          </View>

          <Text style={styles.emptyTitle}>
            No Bills Found
          </Text>

          <Text style={styles.emptyText}>
            Your consultation bills will appear here after
            a doctor generates them.
          </Text>
        </View>
      )}

      {/* Bill Cards */}
      {!loading &&
        bills.map((bill, index) => {
          const isPaid = bill.status === 'Paid';

          return (
            <View
              key={bill.id}
              style={styles.billCard}
            >
              {/* Bill Header */}
              <View style={styles.billHeader}>
                <View style={styles.billHeaderLeft}>
                  <View style={styles.billIcon}>
                    <Text style={styles.billIconText}>
                      🧾
                    </Text>
                  </View>

                  <View style={styles.billHeaderInfo}>
                    <Text style={styles.billLabel}>
                      BILL
                    </Text>

                    <Text style={styles.billId}>
                      #{bill.id.slice(0, 6)}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    isPaid
                      ? styles.paidStatus
                      : styles.pendingStatus,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      isPaid
                        ? styles.paidStatusText
                        : styles.pendingStatusText,
                    ]}
                  >
                    {isPaid ? '✓ ' : '• '}
                    {bill.status}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Doctor */}
              <View style={styles.detailRow}>
                <View style={styles.detailIconBox}>
                  <Text style={styles.detailIcon}>
                    👨‍⚕️
                  </Text>
                </View>

                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>
                    Doctor
                  </Text>

                  <Text style={styles.detailValue}>
                    {bill.doctorName}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <View style={styles.detailRow}>
                <View style={styles.detailIconBox}>
                  <Text style={styles.detailIcon}>
                    📋
                  </Text>
                </View>

                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>
                    Description
                  </Text>

                  <Text style={styles.detailValue}>
                    {bill.description}
                  </Text>
                </View>
              </View>

              {/* Date */}
              <View style={styles.detailRow}>
                <View style={styles.detailIconBox}>
                  <Text style={styles.detailIcon}>
                    📅
                  </Text>
                </View>

                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>
                    Date
                  </Text>

                  <Text style={styles.detailValue}>
                    {bill.date}
                  </Text>
                </View>
              </View>

              {/* Amount */}
              <View style={styles.amountSection}>
                <View>
                  <Text style={styles.amountLabel}>
                    Total Amount
                  </Text>

                  <Text style={styles.amount}>
                    ₹{Number(bill.amount).toFixed(2)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.amountStatus,
                    isPaid
                      ? styles.amountPaid
                      : styles.amountPending,
                  ]}
                >
                  <Text
                    style={[
                      styles.amountStatusText,
                      isPaid
                        ? styles.amountPaidText
                        : styles.amountPendingText,
                    ]}
                  >
                    {isPaid
                      ? 'Payment Complete'
                      : 'Payment Pending'}
                  </Text>
                </View>
              </View>

              {/* Payment Button */}
              {!isPaid && (
                <TouchableOpacity
                  style={styles.paymentButton}
                  onPress={() => handlePayment(bill.id)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.paymentButtonIcon}>
                    ₹
                  </Text>

                  <Text style={styles.paymentButtonText}>
                    Pay Now
                  </Text>
                </TouchableOpacity>
              )}

              {/* Paid Message */}
              {isPaid && (
                <View style={styles.paidMessage}>
                  <Text style={styles.paidMessageIcon}>
                    ✓
                  </Text>

                  <Text style={styles.paidMessageText}>
                    This bill has already been paid.
                  </Text>
                </View>
              )}

              {/* Bill Number */}
              <Text style={styles.billNumber}>
                Bill {index + 1} of {bills.length}
              </Text>
            </View>
          );
        })}

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.85}
      >
        <Text style={styles.backArrow}>‹</Text>

        <Text style={styles.backButtonText}>
          Back
        </Text>
      </TouchableOpacity>
    </ScrollView>
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
    fontSize: 28,
    fontWeight: '800',
    color: '#153B56',
  },

  subtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 4,
    lineHeight: 19,
  },

  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#667085',
    fontSize: 14,
  },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  paidSummaryIcon: {
    backgroundColor: '#EAF7EC',
  },

  pendingSummaryIcon: {
    backgroundColor: '#FFF4DF',
  },

  summaryIconText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1769AA',
  },

  summaryNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#153B56',
  },

  summaryLabel: {
    fontSize: 10,
    color: '#8A94A6',
    marginTop: 1,
  },

  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5EAF0',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
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
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 21,
  },

  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  billHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },

  billIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  billIconText: {
    fontSize: 24,
  },

  billHeaderInfo: {
    flex: 1,
  },

  billLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A94A6',
    letterSpacing: 0.8,
    marginBottom: 3,
  },

  billId: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1769AA',
  },

  statusBadge: {
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 20,
  },

  paidStatus: {
    backgroundColor: '#EAF7EC',
  },

  pendingStatus: {
    backgroundColor: '#FFF4DF',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },

  paidStatusText: {
    color: '#2E7D32',
  },

  pendingStatusText: {
    color: '#A15C00',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF1F4',
    marginVertical: 16,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  detailIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  detailIcon: {
    fontSize: 18,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 11,
    color: '#8A94A6',
    marginBottom: 3,
  },

  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#263238',
  },

  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7FAFC',
    borderRadius: 15,
    padding: 15,
    marginTop: 2,
  },

  amountLabel: {
    fontSize: 11,
    color: '#8A94A6',
    marginBottom: 3,
  },

  amount: {
    fontSize: 25,
    fontWeight: '800',
    color: '#1769AA',
  },

  amountStatus: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  amountPaid: {
    backgroundColor: '#EAF7EC',
  },

  amountPending: {
    backgroundColor: '#FFF4DF',
  },

  amountStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  amountPaidText: {
    color: '#2E7D32',
  },

  amountPendingText: {
    color: '#A15C00',
  },

  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1769AA',
    height: 50,
    borderRadius: 13,
    marginTop: 16,
  },

  paymentButtonIcon: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginRight: 7,
  },

  paymentButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  paidMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF7EC',
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 16,
  },

  paidMessageIcon: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '800',
    marginRight: 7,
  },

  paidMessageText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '700',
  },

  billNumber: {
    textAlign: 'center',
    fontSize: 10,
    color: '#98A2B3',
    marginTop: 13,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#64748B',
    height: 50,
    borderRadius: 13,
    marginTop: 2,
    marginBottom: 5,
  },

  backArrow: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 28,
    marginRight: 5,
    marginTop: -2,
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});