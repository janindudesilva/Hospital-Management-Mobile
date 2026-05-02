import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, TextInput, Alert, Modal } from 'react-native';
import { api } from '../../services/api';
import { Theme } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: 'Password123!' });

  const fetchPatients = async () => {
    try {
      const response = await api.get('/users');
      // Filter out only patients if backend returns all users
      const onlyPatients = (response.data.data || []).filter((u: any) => u.role === 'patient');
      setPatients(onlyPatients); 
    } catch (error) {
      console.error('Fetch patients error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSavePatient = async () => {
    if (!form.fullName || !form.email) return Alert.alert('Error', 'Name and email required');
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, form);
        Alert.alert('Success', 'Patient record updated successfully');
      } else {
        await api.post('/auth/register', { ...form, role: 'patient' });
        Alert.alert('Success', 'Patient registered. Default password is: Password123!');
      }
      setModalVisible(false);
      setEditingId(null);
      setForm({ fullName: '', email: '', phone: '', password: 'Password123!' });
      fetchPatients();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save patient');
    }
  };

  const handleEdit = (item: any) => {
    setForm({
      fullName: item.fullName,
      email: item.email || '',
      phone: item.phone || '',
      password: 'Password123!'
    });
    setEditingId(item._id);
    setModalVisible(true);
  };

  const deletePatient = (id: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this patient record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/users/${id}`);
          Alert.alert('Success', 'Patient record deleted');
          fetchPatients();
        } catch (e) {
          Alert.alert('Error', 'Failed to delete patient');
        }
      }}
    ]);
  };

  const filteredPatients = patients.filter((p: any) => 
    p.fullName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Theme.colors.textMuted} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search patients..." 
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={filteredPatients}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }) => (
          <View style={styles.patientCard}>
            <View style={styles.patientInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.fullName.charAt(0)}</Text>
              </View>
              <View style={styles.details}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.subtext}>{item.phone || item.email}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Active</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <ActionButton icon="eye-outline" color="#4F46E5" onPress={() => Alert.alert('View', 'View details')} />
              <ActionButton icon="create-outline" color="#10B981" onPress={() => handleEdit(item)} />
              <ActionButton icon="trash-outline" color="#EF4444" onPress={() => deletePatient(item._id)} />
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={<Text style={styles.empty}>No patient records found</Text>}
      />

      {/* Add Patient Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Patient' : 'Add New Patient'}</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Full Name" 
              value={form.fullName}
              onChangeText={(v) => setForm({...form, fullName: v})}
            />
            {!editingId && (
              <TextInput 
                style={styles.input} 
                placeholder="Email" 
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(v) => setForm({...form, email: v})}
              />
            )}
            <TextInput 
              style={styles.input} 
              placeholder="Phone" 
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(v) => setForm({...form, phone: v})}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSavePatient}>
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

function ActionButton({ icon, color, onPress }: any) {
  return (
    <Pressable style={[styles.actionBtn, { backgroundColor: color + '15' }]} onPress={onPress}>
      <Ionicons name={icon} size={18} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', padding: 20, gap: 12, alignItems: 'center' },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: Theme.colors.border },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  addButton: { width: 50, height: 50, borderRadius: 16, backgroundColor: Theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  patientCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Theme.colors.border },
  patientInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Theme.colors.primary + '20', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: Theme.colors.primary },
  details: { flex: 1, marginLeft: 16 },
  name: { fontSize: 16, fontWeight: '700', color: Theme.colors.text },
  subtext: { fontSize: 13, color: Theme.colors.textMuted, marginTop: 2 },
  badge: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#059669' },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Theme.colors.border, paddingTop: 12, gap: 12 },
  actionBtn: { flex: 1, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 40, color: Theme.colors.textMuted, fontSize: 16 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20, color: Theme.colors.text },
  input: { backgroundColor: Theme.colors.background, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Theme.colors.border },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  cancelBtn: { padding: 12, paddingHorizontal: 20 },
  cancelText: { color: Theme.colors.textMuted, fontWeight: '600' },
  saveBtn: { backgroundColor: Theme.colors.primary, padding: 12, paddingHorizontal: 24, borderRadius: 12 },
  saveText: { color: '#fff', fontWeight: '700' }
});
