import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth-context';
import { Theme } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    medicalHistory: ''
  });
  const { clearSession } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/profile');
      setData(response.data.data);
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  const user = data?.user;
  const profile = data?.profile;

  const openEditModal = () => {
    setForm({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: profile?.address || '',
      emergencyContact: profile?.emergencyContact || '',
      medicalHistory: profile?.medicalHistory || ''
    });
    setEditVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      Alert.alert('Validation', 'Name and email are required');
      return;
    }

    try {
      setSavingProfile(true);
      await api.put('/users/profile', {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        profile: {
          address: form.address.trim(),
          emergencyContact: form.emergencyContact.trim(),
          medicalHistory: form.medicalHistory.trim(),
          phone: form.phone.trim()
        }
      });

      setEditVisible(false);
      await fetchProfile();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete Profile',
      'This will permanently delete your account and profile data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingProfile(true);
              await api.delete('/users/profile');
              Alert.alert('Deleted', 'Your profile has been deleted');
              await clearSession();
            } catch (error: any) {
              Alert.alert('Error', error?.response?.data?.message || 'Failed to delete profile');
            } finally {
              setDeletingProfile(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Text style={styles.name}>{user?.fullName || 'User Name'}</Text>
        <Text style={styles.role}>{user?.role?.toUpperCase() || 'PATIENT'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.card}>
          <InfoRow icon="mail-outline" label="Email" value={user?.email} />
          <InfoRow icon="call-outline" label="Phone" value={user?.phone || 'Not provided'} />
          {user?.role === 'doctor' && (
            <>
              <InfoRow icon="briefcase-outline" label="Specialization" value={profile?.specialization} />
              <InfoRow icon="business-outline" label="Department" value={profile?.department} />
            </>
          )}
        </View>
      </View>

      {user?.role === 'patient' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Settings</Text>
          <View style={styles.card}>
            <Pressable style={styles.actionRow} onPress={openEditModal}>
              <View style={styles.actionIcon}>
                <Ionicons name="create-outline" size={20} color={Theme.colors.primary} />
              </View>
              <Text style={styles.actionText}>Edit My Profile</Text>
              <Ionicons name="chevron-forward" size={20} color={Theme.colors.textMuted} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.actionRow} onPress={handleDeleteProfile} disabled={deletingProfile}>
              <View style={[styles.actionIcon, { backgroundColor: Theme.colors.error + '15' }]}>
                {deletingProfile ? (
                  <ActivityIndicator size="small" color={Theme.colors.error} />
                ) : (
                  <Ionicons name="trash-outline" size={20} color={Theme.colors.error} />
                )}
              </View>
              <Text style={[styles.actionText, { color: Theme.colors.error }]}>Delete My Profile</Text>
            </Pressable>
          </View>
        </View>
      )}

      {user?.role === 'doctor' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.card}>
            <Pressable style={styles.actionRow} onPress={handleDeleteProfile} disabled={deletingProfile}>
              <View style={[styles.actionIcon, { backgroundColor: Theme.colors.error + '15' }]}>
                {deletingProfile ? (
                  <ActivityIndicator size="small" color={Theme.colors.error} />
                ) : (
                  <Ionicons name="trash-outline" size={20} color={Theme.colors.error} />
                )}
              </View>
              <Text style={[styles.actionText, { color: Theme.colors.error }]}>Delete My Account</Text>
            </Pressable>
          </View>
        </View>
      )}

      {user?.role === 'patient' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Portals</Text>
          <View style={styles.card}>
            <Pressable style={styles.actionRow} onPress={() => router.push('/(tabs)/patient-history')}>
              <View style={styles.actionIcon}>
                <Ionicons name="medical" size={20} color={Theme.colors.primary} />
              </View>
              <Text style={styles.actionText}>Medical History & Records</Text>
              <Ionicons name="chevron-forward" size={20} color={Theme.colors.textMuted} />
            </Pressable>
            
            <View style={styles.divider} />
            
            <Pressable style={styles.actionRow} onPress={() => router.push('/(tabs)/patient-billing')}>
              <View style={styles.actionIcon}>
                <Ionicons name="card" size={20} color={Theme.colors.primary} />
              </View>
              <Text style={styles.actionText}>Billing & Payments</Text>
              <Ionicons name="chevron-forward" size={20} color={Theme.colors.textMuted} />
            </Pressable>
          </View>
        </View>
      )}

      <Pressable style={styles.logoutButton} onPress={clearSession}>
        <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
      
      <Text style={styles.footer}>HMS Mobile v1.0.0</Text>

      <Modal visible={editVisible} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Pressable onPress={() => setEditVisible(false)}>
              <Ionicons name="close" size={24} color={Theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput style={styles.input} value={form.fullName} onChangeText={(v) => setForm({ ...form, fullName: v })} />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput style={styles.input} value={form.email} keyboardType="email-address" autoCapitalize="none" onChangeText={(v) => setForm({ ...form, email: v })} />

            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput style={styles.input} value={form.phone} keyboardType="phone-pad" onChangeText={(v) => setForm({ ...form, phone: v })} />

            <Text style={styles.inputLabel}>Address</Text>
            <TextInput style={styles.input} value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} />

            <Text style={styles.inputLabel}>Emergency Contact</Text>
            <TextInput style={styles.input} value={form.emergencyContact} onChangeText={(v) => setForm({ ...form, emergencyContact: v })} />

            <Text style={styles.inputLabel}>Medical History</Text>
            <TextInput
              style={[styles.input, { minHeight: 90, textAlignVertical: 'top' }]}
              value={form.medicalHistory}
              multiline
              onChangeText={(v) => setForm({ ...form, medicalHistory: v })}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable style={styles.saveButton} onPress={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={Theme.colors.primary} style={{ marginRight: 12 }} />
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '-'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 22, fontWeight: '700', color: Theme.colors.text },
  role: { fontSize: 12, fontWeight: '600', color: Theme.colors.primary, letterSpacing: 1, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Theme.colors.text, marginBottom: 12, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Theme.colors.border },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoLabel: { fontSize: 12, color: Theme.colors.textMuted },
  infoValue: { fontSize: 15, fontWeight: '500', color: Theme.colors.text },
  logoutButton: { backgroundColor: Theme.colors.error, flexDirection: 'row', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  footer: { textAlign: 'center', marginTop: 32, color: Theme.colors.textMuted, fontSize: 12 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  actionIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Theme.colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  actionText: { flex: 1, fontSize: 16, fontWeight: '600', color: Theme.colors.text },
  divider: { height: 1, backgroundColor: Theme.colors.border, my: 12, marginVertical: 12 }
  ,
  modalContainer: { flex: 1, backgroundColor: Theme.colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Theme.colors.text },
  modalBody: { padding: 20, paddingBottom: 30 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: Theme.colors.textMuted, marginBottom: 8, marginTop: 12, textTransform: 'uppercase' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Theme.colors.text },
  modalFooter: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: Theme.colors.border },
  saveButton: { backgroundColor: Theme.colors.primary, paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
