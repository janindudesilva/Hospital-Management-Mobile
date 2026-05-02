import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, TextInput, Alert, Modal, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
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
    fullName: '', email: '', phone: '', password: '', 
    specialization: '', department: '', experience: '', fee: '', qualification: '' 
  });
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);

  const departmentPickerItems = useMemo(() => {
    const list = [...departments];
    if (form.department && !list.some((d) => d.name === form.department)) {
      list.push({ _id: '_current', name: form.department });
    }
    return list;
  }, [departments, form.department]);

  const setPhoneDigits = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    setForm((f) => ({ ...f, phone: digits }));
  };

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

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setDeptLoading(true);
        const res = await api.get('/departments');
        setDepartments(res.data.data || []);
      } catch {
        setDepartments([]);
      } finally {
        setDeptLoading(false);
      }
    };
    loadDepartments();
  }, []);

  const handleSaveDoctor = async () => {
    // Basic validations
    if (!form.fullName.trim()) return Alert.alert('Validation Error', 'Full name is required');
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) return Alert.alert('Validation Error', 'Valid email is required');
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone)) return Alert.alert('Validation Error', 'Phone number must be exactly 10 digits');
    if (!form.department.trim()) return Alert.alert('Validation Error', 'Department is required');
    if (!form.specialization.trim()) return Alert.alert('Validation Error', 'Specialization is required');
    if (!form.qualification.trim()) return Alert.alert('Validation Error', 'Qualification is required');
    if (!form.experience || isNaN(Number(form.experience))) return Alert.alert('Validation Error', 'Valid experience (years) is required');
    if (!form.fee || isNaN(Number(form.fee))) return Alert.alert('Validation Error', 'Valid consultation fee is required');

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
        await api.put(`/doctors/${editingId}`, {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          specialization: form.specialization.trim(),
          department: form.department.trim(),
          qualification: form.qualification.trim(),
          experience: String(form.experience).trim(),
          consultationFee: Number(form.fee),
        });
        Alert.alert('Success', 'Doctor details updated successfully');
      } else {
        await api.post('/auth/register', {
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          password: form.password,
          role: 'doctor',
          specialization: form.specialization.trim(),
          department: form.department.trim(),
          qualification: form.qualification.trim(),
          experience: String(form.experience).trim(),
          consultationFee: Number(form.fee),
        });
        Alert.alert('Success', 'Doctor registered successfully');
      }
      setModalVisible(false);
      setEditingId(null);
      setForm({ 
        fullName: '', email: '', phone: '', password: '', 
        specialization: '', department: '', experience: '', fee: '', qualification: '' 
      });
      fetchDoctors();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save doctor');
    }
  };

  const handleEdit = (item: any) => {
    setForm({
      fullName: item.fullName,
      email: item.email || '',
      phone: String(item.phone || '').replace(/\D/g, '').slice(0, 10),
      password: '',
      specialization: item.specialization,
      department: item.department,
      experience: item.experience != null ? String(item.experience) : '',
      fee: item.consultationFee != null ? String(item.consultationFee) : '',
      qualification: item.qualification || ''
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
        <Pressable style={styles.addButton} onPress={() => {
          setEditingId(null);
          setForm({ 
            fullName: '', email: '', phone: '', password: '', 
            specialization: '', department: '', experience: '', fee: '', qualification: '' 
          });
          setModalVisible(true);
        }}>
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
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <TextInput style={styles.input} placeholder="Full Name" value={form.fullName} onChangeText={(v) => setForm({...form, fullName: v})} />
              {!editingId && (
                <>
                  <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(v) => setForm({...form, email: v})} />
                  <TextInput style={styles.input} placeholder="Password (8+ chars, upper, lower, number, symbol)" secureTextEntry value={form.password} onChangeText={(v) => setForm({...form, password: v})} />
                </>
              )}
              <TextInput
                style={styles.input}
                placeholder="Phone Number (10 digits)"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={setPhoneDigits}
                maxLength={10}
              />
              <View style={styles.pickerWrap}>
                <Ionicons name="business-outline" size={20} color={Theme.colors.textMuted} style={styles.pickerIcon} />
                {deptLoading ? (
                  <ActivityIndicator size="small" color={Theme.colors.primary} style={styles.pickerLoading} />
                ) : (
                  <View style={styles.pickerInner}>
                    <Picker
                      selectedValue={form.department}
                      onValueChange={(val) => setForm((f) => ({ ...f, department: val }))}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select Department" value="" color={Theme.colors.textMuted} />
                      {departmentPickerItems.map((dept) => (
                        <Picker.Item key={dept._id} label={dept.name} value={dept.name} />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>
              <TextInput style={styles.input} placeholder="Specialization" value={form.specialization} onChangeText={(v) => setForm({...form, specialization: v})} />
              <TextInput style={styles.input} placeholder="Qualification (e.g., MBBS, MD)" value={form.qualification} onChangeText={(v) => setForm({...form, qualification: v})} />
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
  pickerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingLeft: 12,
    minHeight: 52,
  },
  pickerIcon: { marginRight: 4 },
  pickerInner: { flex: 1, justifyContent: 'center' },
  picker: { marginLeft: -8, color: Theme.colors.text },
  pickerLoading: { flex: 1, paddingVertical: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  cancelBtn: { padding: 12, paddingHorizontal: 20 },
  cancelText: { color: Theme.colors.textMuted, fontWeight: '600' },
  saveBtn: { backgroundColor: Theme.colors.primary, padding: 12, paddingHorizontal: 24, borderRadius: 12 },
  saveText: { color: '#fff', fontWeight: '700' }
});
