import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, TextInput, Alert, Modal, ScrollView } from 'react-native';
import { api } from '../../services/api';
import { Theme } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ 
    fullName: '', email: '', phone: '', password: '', 
    dateOfBirth: '', gender: 'male', address: '' 
  });

  const setPhoneDigits = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    setForm((f) => ({ ...f, phone: digits }));
  };

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
    // Basic validations
    if (!form.fullName.trim()) return Alert.alert('Validation Error', 'Full name is required');
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) return Alert.alert('Validation Error', 'Valid email is required');
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone)) return Alert.alert('Validation Error', 'Phone number must be exactly 10 digits');
    if (!form.dateOfBirth.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth)) {
      return Alert.alert('Validation Error', 'Date of birth is required in YYYY-MM-DD format');
    }
    
    const dob = new Date(form.dateOfBirth);
    if (isNaN(dob.getTime()) || dob >= new Date()) {
      return Alert.alert('Validation Error', 'Date of birth must be a valid past date');
    }

    if (!form.address.trim()) return Alert.alert('Validation Error', 'Address is required');

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!editingId) {
      if (!form.password.trim()) return Alert.alert('Validation Error', 'Password is required');
      if (!strongPassword.test(form.password)) {
        return Alert.alert(
          'Validation Error',
          'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character'
        );
      }
    }

    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          profile: {
            dateOfBirth: form.dateOfBirth,
            gender: form.gender,
            address: form.address.trim(),
          },
        });
        Alert.alert('Success', 'Patient record updated successfully');
      } else {
        await api.post('/auth/register', {
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          password: form.password,
          role: 'patient',
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          address: form.address.trim(),
        });
        Alert.alert('Success', 'Patient registered successfully');
      }
      setModalVisible(false);
      setEditingId(null);
      setForm({ 
        fullName: '', email: '', phone: '', password: '', 
        dateOfBirth: '', gender: 'male', address: '' 
      });
      fetchPatients();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save patient');
    }
  };

  const handleEdit = (item: any) => {
    setForm({
      fullName: item.fullName,
      email: item.email || '',
      phone: String(item.phone || '').replace(/\D/g, '').slice(0, 10),
      password: '',
      dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth).toISOString().split('T')[0] : '',
      gender: ['male', 'female', 'other'].includes(item.gender) ? item.gender : 'male',
      address: item.address || '',
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
        <Pressable style={styles.addButton} onPress={() => {
          setEditingId(null);
          setForm({ 
            fullName: '', email: '', phone: '', password: '', 
            dateOfBirth: '', gender: 'male', address: '' 
          });
          setModalVisible(true);
        }}>
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
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <TextInput 
                style={styles.input} 
                placeholder="Full Name" 
                value={form.fullName}
                onChangeText={(v) => setForm({...form, fullName: v})}
              />
              {!editingId && (
                <>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Email" 
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={form.email}
                    onChangeText={(v) => setForm({...form, email: v})}
                  />
                  <TextInput 
                    style={styles.input} 
                    placeholder="Password (8+ chars, upper, lower, number, symbol)"
                    secureTextEntry
                    value={form.password}
                    onChangeText={(v) => setForm({...form, password: v})}
                  />
                </>
              )}
              <TextInput 
                style={styles.input} 
                placeholder="Phone (10 digits)" 
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={setPhoneDigits}
                maxLength={10}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Date of Birth (YYYY-MM-DD)" 
                value={form.dateOfBirth}
                onChangeText={(v) => setForm({...form, dateOfBirth: v})}
              />
              <View style={styles.genderContainer}>
                <Text style={styles.label}>Gender:</Text>
                <View style={styles.genderButtons}>
                  {['male', 'female', 'other'].map((g) => (
                    <Pressable 
                      key={g} 
                      style={[styles.genderBtn, form.gender === g && styles.genderBtnActive]}
                      onPress={() => setForm({...form, gender: g})}
                    >
                      <Text style={[styles.genderBtnText, form.gender === g && styles.genderBtnTextActive]}>
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <TextInput 
                style={[styles.input, { height: 100 }]} 
                placeholder="Address" 
                multiline
                numberOfLines={3}
                value={form.address}
                onChangeText={(v) => setForm({...form, address: v})}
              />
            </ScrollView>
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
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20, color: Theme.colors.text },
  input: { backgroundColor: Theme.colors.background, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Theme.colors.border },
  label: { fontSize: 14, fontWeight: '600', color: Theme.colors.text, marginBottom: 8 },
  genderContainer: { marginBottom: 16 },
  genderButtons: { flexDirection: 'row', gap: 8 },
  genderBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: Theme.colors.border, alignItems: 'center', backgroundColor: '#fff' },
  genderBtnActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  genderBtnText: { fontSize: 13, fontWeight: '600', color: Theme.colors.textMuted },
  genderBtnTextActive: { color: '#fff' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  cancelBtn: { padding: 12, paddingHorizontal: 20 },
  cancelText: { color: Theme.colors.textMuted, fontWeight: '600' },
  saveBtn: { backgroundColor: Theme.colors.primary, padding: 12, paddingHorizontal: 24, borderRadius: 12 },
  saveText: { color: '#fff', fontWeight: '700' }
});
