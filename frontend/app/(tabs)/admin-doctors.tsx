import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, TextInput, Alert, Modal, ScrollView } from 'react-native';
import { api } from '../../services/api';
import { Theme } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ 
    fullName: '', email: '', phone: '', password: 'Password123!', 
    specialization: '', department: '', experience: '', fee: '' 
  });

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data.data);
    } catch (error) {
      console.error('Fetch doctors error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSaveDoctor = async () => {
    if (!form.fullName || !form.email || !form.department) return Alert.alert('Error', 'Name, email, and department are required');
    try {
      if (editingId) {
        await api.put(`/doctors/${editingId}`, form);
        Alert.alert('Success', 'Doctor details updated successfully');
      } else {
        // Create user first
        await api.post('/auth/register', { 
          fullName: form.fullName, email: form.email, phone: form.phone, password: form.password, role: 'doctor' 
        });
        Alert.alert('Success', 'Doctor registered. Default password is: Password123!');
      }
      setModalVisible(false);
      setEditingId(null);
      setForm({ fullName: '', email: '', phone: '', password: 'Password123!', specialization: '', department: '', experience: '', fee: '' });
      fetchDoctors();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save doctor');
    }
  };

  const handleEdit = (item: any) => {
    setForm({
      fullName: item.fullName,
      email: item.email || '',
      phone: item.phone || '',
      password: 'Password123!',
      specialization: item.specialization,
      department: item.department,
      experience: item.experience?.toString() || '',
      fee: item.consultationFee?.toString() || ''
    });
    setEditingId(item._id);
    setModalVisible(true);
  };

  const deleteDoctor = (id: string) => {
    Alert.alert('Delete', 'Are you sure you want to remove this doctor?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/doctors/${id}`);
          Alert.alert('Success', 'Doctor removed successfully');
          fetchDoctors();
        } catch (e) {
          Alert.alert('Error', 'Failed to delete doctor');
        }
      }}
    ]);
  };

  const filteredDoctors = doctors.filter((d: any) => 
    d.fullName.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase()) ||
    d.department.toLowerCase().includes(search.toLowerCase())
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
            placeholder="Search doctors..." 
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={filteredDoctors}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }) => (
          <View style={styles.doctorCard}>
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Ionicons name="medical" size={24} color={Theme.colors.primary} />
              </View>
              <View style={styles.details}>
                <Text style={styles.name}>{item.fullName}</Text>
                <View style={styles.specBadge}>
                  <Text style={styles.specText}>{item.specialization}</Text>
                </View>
                <Text style={styles.deptText}>Department: {item.department}</Text>
              </View>
            </View>
            
            <View style={styles.infoGrid}>
              <InfoItem icon="time-outline" label="Experience" value={`${item.experience} Yrs`} />
              <InfoItem icon="call-outline" label="Phone" value={item.phone || '-'} />
            </View>

            <View style={styles.actions}>
              <ActionButton icon="create-outline" color={Theme.colors.primary} label="Edit" onPress={() => handleEdit(item)} />
              <ActionButton icon="trash-outline" color={Theme.colors.error} label="Delete" onPress={() => deleteDoctor(item._id)} />
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={<Text style={styles.empty}>No doctors found</Text>}
      />

      {/* Add Doctor Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Doctor Info' : 'Add New Doctor'}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput style={styles.input} placeholder="Full Name" value={form.fullName} onChangeText={(v) => setForm({...form, fullName: v})} />
              {!editingId && (
                <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(v) => setForm({...form, email: v})} />
              )}
              <TextInput style={styles.input} placeholder="Department (e.g., Cardiology)" value={form.department} onChangeText={(v) => setForm({...form, department: v})} />
              <TextInput style={styles.input} placeholder="Specialization" value={form.specialization} onChangeText={(v) => setForm({...form, specialization: v})} />
              <TextInput style={styles.input} placeholder="Experience (Years)" keyboardType="numeric" value={form.experience} onChangeText={(v) => setForm({...form, experience: v})} />
              <TextInput style={styles.input} placeholder="Consultation Fee" keyboardType="numeric" value={form.fee} onChangeText={(v) => setForm({...form, fee: v})} />
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSaveDoctor}>
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

function InfoItem({ icon, label, value }: any) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={14} color={Theme.colors.textMuted} />
      <Text style={styles.infoLabel}>{label}: </Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ActionButton({ icon, color, label, onPress }: any) {
  return (
    <Pressable style={styles.actionBtn} onPress={onPress}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.actionText, { color }]}>{label}</Text>
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
  doctorCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Theme.colors.border },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  avatar: { width: 50, height: 50, borderRadius: 12, backgroundColor: Theme.colors.primary + '10', justifyContent: 'center', alignItems: 'center' },
  details: { flex: 1, marginLeft: 16 },
  name: { fontSize: 18, fontWeight: '700', color: Theme.colors.text },
  specBadge: { backgroundColor: Theme.colors.primary + '15', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 6 },
  specText: { fontSize: 12, fontWeight: '600', color: Theme.colors.primary },
  deptText: { fontSize: 13, color: Theme.colors.textMuted, marginTop: 6 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Theme.colors.border },
  infoItem: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: { fontSize: 12, color: Theme.colors.textMuted, marginLeft: 6 },
  infoValue: { fontSize: 12, fontWeight: '600', color: Theme.colors.text },
  actions: { flexDirection: 'row', paddingTop: 12, gap: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 8 },
  actionText: { fontSize: 14, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, color: Theme.colors.textMuted, fontSize: 16 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20, color: Theme.colors.text },
  input: { backgroundColor: Theme.colors.background, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Theme.colors.border },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  cancelBtn: { padding: 12, paddingHorizontal: 20 },
  cancelText: { color: Theme.colors.textMuted, fontWeight: '600' },
  saveBtn: { backgroundColor: Theme.colors.primary, padding: 12, paddingHorizontal: 24, borderRadius: 12 },
  saveText: { color: '#fff', fontWeight: '700' }
});
