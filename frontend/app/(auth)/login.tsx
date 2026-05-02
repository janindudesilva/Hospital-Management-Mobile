import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../store/auth-context';
import { authApi } from '../../services/auth-api';
import { Theme } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { saveSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation', 'Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.login({ email, password });
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
      Alert.alert('Login failed', error?.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="medical" size={40} color="#fff" />
        </View>
        <Text style={styles.title}>HMS Mobile</Text>
        <Text style={styles.subtitle}>Sign in to your hospital portal</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={Theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="Email Address / Username" 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none" 
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={Theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="Password" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry={!showPassword} 
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Theme.colors.textMuted} />
          </Pressable>
        </View>

        <Pressable style={styles.button} onPress={onLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text style={styles.link}>Register Now</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: Theme.colors.background, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { width: 80, height: 80, borderRadius: 24, backgroundColor: Theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  title: { fontSize: 32, fontWeight: '800', color: Theme.colors.text },
  subtitle: { fontSize: 16, color: Theme.colors.textMuted, marginTop: 4 },
  form: { width: '100%' },
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
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: Theme.colors.textMuted, fontSize: 15 },
  link: { color: Theme.colors.primary, fontWeight: '700', fontSize: 15 }
});
