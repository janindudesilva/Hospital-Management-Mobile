import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { api } from '../../services/api';
import { Theme } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setData(response.data.data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  const { stats, recentRegistrations } = data || {};

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.sectionTitle}>Executive Overview</Text>
      
      <View style={styles.statsGrid}>
        <StatCard 
          icon="people" 
          label="Total Patients" 
          value={stats?.totalPatients || 0} 
          color="#4F46E5" 
        />
        <StatCard 
          icon="medical" 
          label="Registered Doctors" 
          value={stats?.totalDoctors || 0} 
          color="#10B981" 
        />
        <StatCard 
          icon="business" 
          label="Departments" 
          value={stats?.totalDepartments || 0} 
          color="#F59E0B" 
        />
        <StatCard 
          icon="cash" 
          label="Total Revenue" 
          value={`LKR ${stats?.totalRevenue || 0}`} 
          color="#EF4444" 
        />
      </View>

      <Text style={styles.sectionTitle}>Recent Registrations</Text>
      <View style={styles.card}>
        {recentRegistrations?.map((user: any) => (
          <View key={user._id} style={styles.userRow}>
            <View style={[styles.roleBadge, { backgroundColor: user.role === 'doctor' ? '#D1FAE5' : '#DBEAFE' }]}>
              <Ionicons 
                name={user.role === 'doctor' ? 'medical' : 'person'} 
                size={16} 
                color={user.role === 'doctor' ? '#059669' : '#2563EB'} 
              />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.fullName}</Text>
              <Text style={styles.userRole}>{user.role.toUpperCase()}</Text>
            </View>
            <Text style={styles.userDate}>{new Date(user.createdAt).toLocaleDateString()}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Theme.colors.text, marginBottom: 16, marginTop: 10 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { 
    width: '48%', 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: Theme.colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 20, fontWeight: '800', color: Theme.colors.text },
  statLabel: { fontSize: 12, color: Theme.colors.textMuted, marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: Theme.colors.border },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  roleBadge: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  userDetails: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600', color: Theme.colors.text },
  userRole: { fontSize: 11, fontWeight: '700', color: Theme.colors.textMuted, marginTop: 2 },
  userDate: { fontSize: 12, color: Theme.colors.textMuted }
});
