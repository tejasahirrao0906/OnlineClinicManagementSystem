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

import { db } from '../firebaseConfig';

type Bill = {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  description: string;
  amount: string;
  status: string;
  date: string;
};

export default function ManageBillsScreen() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'bills'),
      async (snapshot) => {
        try {
          const billList: Bill[] =
            await Promise.all(
              snapshot.docs.map(async (item) => {
                const data = item.data();

                let patientName =
                  data.patientName ||
                  'Unknown Patient';

                if (
                  data.patientId &&
                  !data.patientName
                ) {
                  try {
                    const patientRef = doc(
                      db,
                      'users',
                      data.patientId,
                    );

                    const patientSnapshot =
                      await getDoc(patientRef);

                    if (
                      patientSnapshot.exists()
                    ) {
                      const patientData =
                        patientSnapshot.data();

                      patientName =
                        patientData.name ||
                        'Unknown Patient';
                    }
                  } catch (error) {
                    console.log(
                      'Patient name loading error:',
                      error,
                    );
                  }
                }

                return {
                  id: item.id,
                  patientId:
                    data.patientId || '',
                  patientName,
                  doctorName:
                    data.doctorName ||
                    'Unknown Doctor',
                  description:
                    data.description ||
                    'No description',
                  amount:
                    data.amount !== undefined
                      ? String(data.amount)
                      : '0',
                  status:
                    data.status || 'Pending',
                  date:
                    data.date ||
                    'Not available',
                };
              }),
            );

          setBills(billList);
          setLoading(false);
        } catch (error) {
          console.log(
            'Bills processing error:',
            error,
          );

          setLoading(false);

          Alert.alert(
            'Error',
            'Unable to process bills.',
          );
        }
      },
      (error) => {
        console.log(
          'Bills loading error:',
          error,
        );

        setLoading(false);

        Alert.alert(
          'Error',
          'Unable to load bills.',
        );
      },
    );

    return unsubscribe;
  }, []);

  const getStatusColor = (
    status: string,
  ) => {
    if (
      status.toLowerCase() === 'paid'
    ) {
      return '#15803D';
    }

    if (
      status.toLowerCase() === 'cancelled'
    ) {
      return '#D32F2F';
    }

    return '#1769AA';
  };

  const getStatusBackground = (
    status: string,
  ) => {
    if (
      status.toLowerCase() === 'paid'
    ) {
      return '#DCFCE7';
    }

    if (
      status.toLowerCase() === 'cancelled'
    ) {
      return '#FEE2E2';
    }

    return '#E8F2FA';
  };

  const paidCount = bills.filter(
    (bill) =>
      bill.status.toLowerCase() ===
      'paid',
  ).length;

  const pendingCount = bills.filter(
    (bill) =>
      bill.status.toLowerCase() ===
      'pending',
  ).length;

  const cancelledCount = bills.filter(
    (bill) =>
      bill.status.toLowerCase() ===
      'cancelled',
  ).length;

  const totalAmount = bills.reduce(
    (total, bill) => {
      const amount =
        Number.parseFloat(bill.amount) || 0;

      return total + amount;
    },
    0,
  );

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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>
              ←
            </Text>

            <Text style={styles.backText}>
              Back
            </Text>
          </TouchableOpacity>

          <View style={styles.headerRow}>
            <View
              style={
                styles.headerIconCircle
              }
            >
              <Text style={styles.headerIcon}>
                💳
              </Text>
            </View>

            <View
              style={styles.headerContent}
            >
              <Text style={styles.title}>
                Manage Bills
              </Text>

              <Text style={styles.subtitle}>
                View and monitor clinic bills
              </Text>
            </View>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View
            style={styles.summaryIconCircle}
          >
            <Text style={styles.summaryIcon}>
              💳
            </Text>
          </View>

          <View style={styles.summaryContent}>
            <Text style={styles.summaryNumber}>
              {bills.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Total Bills
            </Text>
          </View>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />

            <Text style={styles.liveText}>
              LIVE
            </Text>
          </View>
        </View>

        {/* Financial Summary */}
        {!loading &&
          bills.length > 0 && (
            <>
              <View
                style={styles.totalAmountCard}
              >
                <View
                  style={
                    styles.amountIconCircle
                  }
                >
                  <Text
                    style={
                      styles.amountIcon
                    }
                  >
                    ₹
                  </Text>
                </View>

                <View
                  style={
                    styles.amountContent
                  }
                >
                  <Text
                      style={
                        styles.totalAmountLabel
                      }
                    >
                      Total Billed Amount
                    </Text>

                  <Text
                    style={
                      styles.totalAmount
                    }
                  >
                    ₹
                    {totalAmount.toFixed(
                      2,
                    )}
                  </Text>
                </View>
              </View>

              <View
                style={styles.statusSummary}
              >
                <View
                  style={
                    styles.statusSummaryCard
                  }
                >
                  <Text
                    style={
                      styles.statusSummaryNumber
                    }
                  >
                    {paidCount}
                  </Text>

                  <Text
                    style={
                      styles.statusSummaryLabel
                    }
                  >
                    Paid
                  </Text>
                </View>

                <View
                  style={
                    styles.statusSummaryCard
                  }
                >
                  <Text
                    style={
                      styles.statusSummaryNumber
                    }
                  >
                    {pendingCount}
                  </Text>

                  <Text
                    style={
                      styles.statusSummaryLabel
                    }
                  >
                    Pending
                  </Text>
                </View>

                <View
                  style={
                    styles.statusSummaryCard
                  }
                >
                  <Text
                    style={
                      styles.statusSummaryNumber
                    }
                  >
                    {cancelledCount}
                  </Text>

                  <Text
                    style={
                      styles.statusSummaryLabel
                    }
                  >
                    Cancelled
                  </Text>
                </View>
              </View>
            </>
          )}

        {/* Section Header */}
        <View
          style={styles.sectionHeader}
        >
          <Text style={styles.sectionTitle}>
            Bill Directory
          </Text>

          <Text
            style={styles.sectionSubtitle}
          >
            {bills.length === 0
              ? 'No bills available'
              : 'View bill information and status'}
          </Text>
        </View>

        {/* Loading */}
        {loading ? (
          <View style={styles.stateCard}>
            <View
              style={styles.loadingCircle}
            >
              <ActivityIndicator
                size="large"
                color="#1769AA"
              />
            </View>

            <Text style={styles.stateTitle}>
              Loading Bills
            </Text>

            <Text
              style={
                styles.stateDescription
              }
            >
              Please wait while bill records
              are being loaded.
            </Text>
          </View>
        ) : bills.length === 0 ? (
          /* Empty State */
          <View style={styles.stateCard}>
            <View
              style={styles.emptyIconCircle}
            >
              <Text style={styles.emptyIcon}>
                💳
              </Text>
            </View>

            <Text style={styles.stateTitle}>
              No Bills Found
            </Text>

            <Text
              style={
                styles.stateDescription
              }
            >
              There are currently no bills
              registered in the system.
            </Text>
          </View>
        ) : (
          /* Bill List */
          <View>
            {bills.map((bill) => (
              <View
                key={bill.id}
                style={styles.billCard}
              >
                {/* Bill Header */}
                <View
                  style={styles.cardHeader}
                >
                  <View
                    style={
                      styles.billIconCircle
                    }
                  >
                    <Text
                      style={
                        styles.billIcon
                      }
                    >
                      💳
                    </Text>
                  </View>

                  <View
                    style={
                      styles.billHeaderInfo
                    }
                  >
                    <Text
                      style={
                        styles.patientName
                      }
                    >
                      {bill.patientName}
                    </Text>

                    <Text
                      style={styles.dateText}
                    >
                      {bill.date}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          getStatusBackground(
                            bill.status,
                          ),
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            getStatusColor(
                              bill.status,
                            ),
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            getStatusColor(
                              bill.status,
                            ),
                        },
                      ]}
                    >
                      {bill.status}
                    </Text>
                  </View>
                </View>

                <View
                  style={styles.separator}
                />

                {/* Doctor */}
                <View
                  style={styles.detailBlock}
                >
                  <Text
                    style={
                      styles.sectionLabel
                    }
                  >
                    DOCTOR
                  </Text>

                  <View
                    style={styles.doctorRow}
                  >
                    <View
                      style={
                        styles.doctorIconCircle
                      }
                    >
                      <Text
                        style={
                          styles.doctorIcon
                        }
                      >
                        👨‍⚕️
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.doctorName
                      }
                    >
                      {bill.doctorName}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <View
                  style={styles.descriptionBox}
                >
                  <Text
                    style={
                      styles.sectionLabel
                    }
                  >
                    DESCRIPTION
                  </Text>

                  <Text
                    style={
                      styles.description
                    }
                  >
                    {bill.description}
                  </Text>
                </View>

                {/* Amount */}
                <View
                  style={styles.amountRow}
                >
                  <View>
                    <Text
                      style={
                        styles.amountLabel
                      }
                    >
                      BILL AMOUNT
                    </Text>

                    <Text
                      style={
                        styles.amountCaption
                      }
                    >
                      Total amount for this bill
                    </Text>
                  </View>

                  <Text
                    style={styles.amount}
                  >
                    ₹{bill.amount}
                  </Text>
                </View>

                {/* Bill ID */}
                <View
                  style={styles.billIdContainer}
                >
                  <Text
                    style={styles.billIdLabel}
                  >
                    Bill ID
                  </Text>

                  <Text
                    style={styles.billId}
                    numberOfLines={1}
                  >
                    {bill.id}
                  </Text>
                </View>

                {/* View Details */}
                <TouchableOpacity
                  style={
                    styles.viewButton
                  }
                  onPress={() =>
                    router.push({
                      pathname:
                        '/bill-details-admin',
                      params: {
                        billId: bill.id,
                      },
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Text
                    style={
                      styles.viewIcon
                    }
                  >
                    👁
                  </Text>

                  <Text
                    style={
                      styles.viewButtonText
                    }
                  >
                    View Bill Details
                  </Text>

                  <Text
                    style={styles.viewArrow}
                  >
                    ›
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Bottom Navigation */}
        <TouchableOpacity
          style={
            styles.dashboardButton
          }
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text
            style={
              styles.dashboardButtonText
            }
          >
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
    fontSize: 27,
  },

  headerContent: {
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

  summaryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FFF7ED',
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

  totalAmountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  amountIconCircle: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  amountIcon: {
    fontSize: 24,
    fontWeight: '800',
    color: '#15803D',
  },

  amountContent: {
    flex: 1,
  },

  totalAmountLabel: {
  fontSize: 10,
  color: '#718096',
  fontWeight: '700',
},

  totalAmount: {
    fontSize: 21,
    color: '#15803D',
    fontWeight: '800',
    marginTop: 2,
  },

  statusSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  statusSummaryCard: {
    width: '31.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  statusSummaryNumber: {
    fontSize: 21,
    fontWeight: '800',
    color: '#1769AA',
  },

  statusSummaryLabel: {
    fontSize: 10,
    color: '#718096',
    marginTop: 2,
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
    backgroundColor: '#FFF7ED',
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

  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
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

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  billIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  billIcon: {
    fontSize: 22,
  },

  billHeaderInfo: {
    flex: 1,
  },

  patientName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },

  dateText: {
    fontSize: 11,
    color: '#718096',
    marginTop: 3,
    fontWeight: '600',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 20,
    marginLeft: 5,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },

  separator: {
    height: 1,
    backgroundColor: '#EEF2F6',
    marginVertical: 14,
  },

  detailBlock: {
    marginBottom: 12,
  },

  sectionLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  doctorIconCircle: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: '#E8F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  doctorIcon: {
    fontSize: 17,
  },

  doctorName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#1769AA',
  },

  descriptionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 11,
    padding: 11,
    marginBottom: 12,
  },

  description: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 11,
    marginBottom: 11,
  },

  amountLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '800',
  },

  amountCaption: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },

  amount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1769AA',
    marginLeft: 10,
  },

  billIdContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  billIdLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  billId: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
  },

  viewButton: {
    minHeight: 43,
    borderRadius: 10,
    backgroundColor: '#E8F2FA',
    borderWidth: 1,
    borderColor: '#1769AA',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginTop: 13,
  },

  viewIcon: {
    fontSize: 14,
    marginRight: 7,
  },

  viewButtonText: {
    flex: 1,
    color: '#1769AA',
    fontSize: 12,
    fontWeight: '800',
  },

  viewArrow: {
    fontSize: 23,
    color: '#1769AA',
    marginLeft: 5,
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