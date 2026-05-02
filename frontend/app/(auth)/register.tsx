import { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Link, router } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../store/auth-context';
import { authApi } from '../../services/auth-api';
import { api } from '../../services/api';
import { Theme } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const { saveSession } = useAuth();
  const [form, setForm] = useState({ 
    fullName: '', email: '', password: '', phone: '', role: 'patient',
    username: '', dateOfBirth: '', age: '', gender: '', address: '',
    department: '', specialization: '', qualification: '', experienceYears: '', consultationFee: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const PHONE_REGEX = /^\d{10}$/;
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  const setPhoneDigits = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    setForm((f) => ({ ...f, phone: digits }));
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setDeptLoading(true);
        const res = await api.get('/departments');
        setDepartments(res.data.data || []);
      } catch {
        // silently fail — user can still type department name
      } finally {
        setDeptLoading(false);
      }
    };
    fetchDepartments();
  }, []);


  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      const diff = Date.now() - selectedDate.getTime();
      const ageNum = Math.abs(new Date(diff).getUTCFullYear() - 1970);
      
      setForm({ ...form, dateOfBirth: formattedDate, age: ageNum.toString() });
    }
  };


  const onRegister = async () => {
    // --- Common field validation ---
    if (!form.fullName.trim()) {
      Alert.alert('Validation', 'Full name is required.');
      return;
    }
    if (!form.email.trim()) {
      Alert.alert('Validation', 'Email address is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      Alert.alert('Validation', 'Please enter a valid email address.');
      return;
    }
    if (!form.phone.trim()) {
      Alert.alert('Validation', 'Phone number is required.');
      return;
    }
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (!PHONE_REGEX.test(phoneDigits)) {
      Alert.alert('Validation', 'Phone number must contain exactly 10 digits.');
      return;
    }
    if (!PASSWORD_REGEX.test(form.password)) {
      Alert.alert(
        'Validation',
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      );
      return;
    }

    // --- Patient-specific validation ---
    if (form.role === 'patient') {
      if (!form.username.trim()) {
        Alert.alert('Validation', 'Username is required for patient registration.');
        return;
      }
      if (!form.dateOfBirth) {
        Alert.alert('Validation', 'Date of birth is required.');
        return;
      }
      const dob = new Date(form.dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(dob.getTime()) || dob >= today) {
        Alert.alert('Validation', 'Date of birth must be a past date.');
        return;
      }
      if (!form.gender) {
        Alert.alert('Validation', 'Please select a gender.');
        return;
      }
    }

    // --- Doctor-specific validation ---
    if (form.role === 'doctor') {
      if (!form.specialization.trim()) {
        Alert.alert('Validation', 'Specialization is required for doctor registration.');
        return;
      }
      if (!form.department.trim()) {
        Alert.alert('Validation', 'Department is required for doctor registration.');
        return;
      }
      if (!form.qualification.trim()) {
        Alert.alert('Validation', 'Qualification is required for doctor registration.');
        return;
      }
      const expYears = String(form.experienceYears).trim();
      if (!expYears) {
        Alert.alert('Validation', 'Years of experience is required for doctor registration.');
        return;
      }
      const feeNum = Number(form.consultationFee);
      if (form.consultationFee.trim() === '' || Number.isNaN(feeNum) || feeNum < 0) {
        Alert.alert('Validation', 'Please enter a valid consultation fee (0 or greater).');
        return;
      }
    }

    try {
      setLoading(true);

      // Build payload with all role-specific fields
      const payload: any = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: phoneDigits,
        role: form.role,
      };

      if (form.role === 'patient') {
        payload.username = form.username.trim();
        payload.dateOfBirth = form.dateOfBirth;
        payload.age = form.age;
        payload.gender = form.gender;
        payload.address = form.address.trim();
      }

      if (form.role === 'doctor') {
        payload.department = form.department.trim();
        payload.specialization = form.specialization.trim();
        payload.qualification = form.qualification.trim();
        // API expects `experience` (not experienceYears) — see backend auth.routes
        payload.experience = String(form.experienceYears).trim();
        payload.consultationFee = Number(form.consultationFee);
      }

      const response = await authApi.register(payload);
      const sessionData = response.data.data;
      await saveSession(sessionData);

      // Redirect based on role
      const role = sessionData.user?.role;
      if (role === 'admin') {
        router.replace('/(tabs)/admin-dashboard');
      } else if (role === 'doctor') {
        router.replace('/(tabs)/doctor-schedule');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          (error.request ? 'Cannot reach server. Check EXPO_PUBLIC_API_URL and backend status.' : 'Request failed.')
        : 'Something went wrong. Please try again.';
      Alert.alert('Registration failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join our hospital community today</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.roleContainer}>
          <Pressable 
            style={[styles.roleButton, form.role === 'patient' && styles.roleButtonActive]} 
            onPress={() => setForm({...form, role: 'patient'})}
          >
            <Ionicons name="person-outline" size={20} color={form.role === 'patient' ? '#fff' : Theme.colors.textMuted} />
            <Text style={[styles.roleText, form.role === 'patient' && styles.roleTextActive]}>Patient</Text>
          </Pressable>
          <Pressable 
            style={[styles.roleButton, form.role === 'doctor' && styles.roleButtonActive]} 
            onPress={() => setForm({...form, role: 'doctor'})}
          >
            <Ionicons name="medical-outline" size={20} color={form.role === 'doctor' ? '#fff' : Theme.colors.textMuted} />
            <Text style={[styles.roleText, form.role === 'doctor' && styles.roleTextActive]}>Doctor</Text>
          </Pressable>
        </View>

        <Input 
          icon="person-outline" 
          placeholder="Full Name" 
          value={form.fullName} 
          onChangeText={(val: string) => setForm({ ...form, fullName: val })} 
        />
        <Input 
          icon="mail-outline" 
          placeholder="Email Address" 
          value={form.email} 
          onChangeText={(val: string) => setForm({ ...form, email: val })} 
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input 
          icon="call-outline" 
          placeholder="Phone Number (10 digits)" 
          value={form.phone} 
          onChangeText={setPhoneDigits} 
          keyboardType="phone-pad"
          maxLength={10}
        />

        {form.role === 'patient' && (
          <>
            <Input 
              icon="person-circle-outline" 
              placeholder="Username" 
              value={form.username} 
              onChangeText={(val: string) => setForm({ ...form, username: val })} 
            />
            <Pressable onPress={() => setShowDatePicker(true)} style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={20} color={Theme.colors.textMuted} style={styles.inputIcon} />
              <Text style={[styles.input, !form.dateOfBirth && { color: Theme.colors.textMuted }]}>
                {form.dateOfBirth || "Date of Birth"}
              </Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}

            <Input 
              icon="time-outline" 
              placeholder="Age (Auto-calculated)" 
              value={form.age} 
              editable={false}
            />

            <View style={styles.inputContainer}>
              <Ionicons name="male-female-outline" size={20} color={Theme.colors.textMuted} style={styles.inputIcon} />
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Picker
                  selectedValue={form.gender || ""}
                  onValueChange={(itemValue) => setForm({ ...form, gender: itemValue })}
                  style={{ color: form.gender ? Theme.colors.text : Theme.colors.textMuted, marginLeft: -10, height: 50 }}
                >
                  <Picker.Item label="Select Gender" value="" color={Theme.colors.textMuted} />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>
            </View>
            <Input 
              icon="location-outline" 
              placeholder="Address" 
              value={form.address} 
              onChangeText={(val: string) => setForm({ ...form, address: val })} 
            />
          </>
        )}

        {form.role === 'doctor' && (
          <>
            <View style={styles.inputContainer}>
              <Ionicons name="business-outline" size={20} color={Theme.colors.textMuted} style={styles.inputIcon} />
              <View style={{ flex: 1, justifyContent: 'center' }}>
                {deptLoading ? (
                  <ActivityIndicator size="small" color={Theme.colors.primary} style={{ paddingVertical: 16 }} />
                ) : (
                  <Picker
                    selectedValue={form.department}
                    onValueChange={(val) => setForm({ ...form, department: val })}
                    style={{ color: form.department ? Theme.colors.text : Theme.colors.textMuted, marginLeft: -10, height: 50 }}
                  >
                    <Picker.Item label="Select Department" value="" color={Theme.colors.textMuted} />
                    {departments.map((dept) => (
                      <Picker.Item key={dept._id} label={dept.name} value={dept.name} />
                    ))}
                  </Picker>
                )}
              </View>
            </View>
            <Input 
              icon="medkit-outline" 
              placeholder="Specialization" 
              value={form.specialization} 
              onChangeText={(val: string) => setForm({ ...form, specialization: val })} 
            />
            <Input 
              icon="school-outline" 
              placeholder="Qualification" 
              value={form.qualification} 
              onChangeText={(val: string) => setForm({ ...form, qualification: val })} 
            />
            <Input 
              icon="briefcase-outline" 
              placeholder="Experience Years" 
              value={form.experienceYears} 
              onChangeText={(val: string) => setForm({ ...form, experienceYears: val })} 
              keyboardType="numeric"
            />
            <Input 
              icon="cash-outline" 
              placeholder="Consultation Fee" 
              value={form.consultationFee} 
              onChangeText={(val: string) => setForm({ ...form, consultationFee: val })} 
              keyboardType="numeric"
            />
          </>
        )}
        
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={Theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="Password" 
            value={form.password} 
            onChangeText={(val: string) => setForm({ ...form, password: val })} 
            secureTextEntry={!showPassword} 
            placeholderTextColor={Theme.colors.textMuted}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Theme.colors.textMuted} />
          </Pressable>
        </View>

        <Pressable style={styles.button} onPress={onRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register as {form.role}</Text>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={styles.link}>Login</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

function Input({ icon, ...props }: any) {
  return (
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={20} color={Theme.colors.textMuted} style={styles.inputIcon} />
      <TextInput style={styles.input} placeholderTextColor={Theme.colors.textMuted} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: Theme.colors.background, justifyContent: 'center' },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: Theme.colors.text },
  subtitle: { fontSize: 16, color: Theme.colors.textMuted, marginTop: 4 },
  form: { width: '100%' },
  roleContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: '#fff' },
  roleButtonActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  roleText: { marginLeft: 8, fontWeight: '600', color: Theme.colors.textMuted },
  roleTextActive: { color: '#fff' },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: Theme.colors.border, 
    marginBottom: 16, 
    paddingHorizontal: 16 
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, color: Theme.colors.text },
  eyeIcon: { padding: 8 },
  button: { 
    backgroundColor: Theme.colors.primary, 
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginTop: 8,
    elevation: 2,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 18, textTransform: 'capitalize' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: Theme.colors.textMuted, fontSize: 15 },
  link: { color: Theme.colors.primary, fontWeight: '700', fontSize: 15 }
});
