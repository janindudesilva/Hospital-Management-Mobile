import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, RefreshControl, Alert, Modal, TextInput } from 'react-native';
import { api } from '../../services/api';
import { Theme } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [form, setForm] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Fetch departments error:', error);
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

  const handleSaveDept = async () => {
    if (!form.name) return Alert.alert('Error', 'Department name is required');
    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, form);
        Alert.alert('Success', 'Department updated successfully');
      } else {
        await api.post('/departments', form);
        Alert.alert('Success', 'Department created successfully');
      }
      setModalVisible(false);
      setEditingId(null);
      setForm({ name: '', description: '' });
      fetchData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save department');
    }
  };

  const handleEdit = (item: any) => {
    setForm({ name: item.name, description: item.description });
    setEditingId(item._id);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Delete this department?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/departments/${id}`);
          fetchData();
        } catch (e) {
          Alert.alert('Error', 'Failed to delete');
        }
      }}
    ]);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={departments}
        keyExtractor={(item: any) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <View style={styles.deptCard}>
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon as any || 'medical'} size={24} color={Theme.colors.primary} />
            </View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.count}>{item.doctorCount || 0} Doctors</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.status || 'Active'}</Text>
            </View>
            <View style={styles.cardActions}>
              <Pressable style={styles.editBtn} onPress={() => handleEdit(item)}>
                <Ionicons name="create-outline" size={16} color={Theme.colors.primary} />
              </Pressable>
              <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                <Ionicons name="trash-outline" size={16} color={Theme.colors.error} />
              </Pressable>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.headerTitle}>Clinical Units</Text>
            <Pressable style={styles.addButton} onPress={() => {
              setEditingId(null);
              setForm({ name: '', description: '' });
              setModalVisible(true);
            }}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addText}>New Dept</Text>
            </Pressable>
          </View>
        }
      />

      {/* Add/Edit Dept Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Department' : 'Add Department'}</Text>
            <TextInput style={styles.input} placeholder="Department Name" value={form.name} onChangeText={(v) => setForm({...form, name: v})} />
            <TextInput style={styles.input} placeholder="Description" value={form.description} onChangeText={(v) => setForm({...form, description: v})} />

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSaveDept}>
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Theme.colors.text },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 6 },
  addText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  columnWrapper: { justifyContent: 'space-between' },
  deptCard: { 
    width: '48%', 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: Theme.colors.border,
    alignItems: 'center',
    position: 'relative'
  },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: Theme.colors.primary + '10', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 16, fontWeight: '700', color: Theme.colors.text, textAlign: 'center' },
  count: { fontSize: 12, color: Theme.colors.textMuted, marginTop: 4 },
  badge: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 12 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#059669' },
  cardActions: { flexDirection: 'row', position: 'absolute', top: 12, right: 12, gap: 8 },
  editBtn: { padding: 4 },
  deleteBtn: { padding: 4 },
  
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
