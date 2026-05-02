import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../constants/Theme';
import { useAuth } from '../../store/auth-context';

export default function TabsLayout() {
  const { session } = useAuth();
  const role = session?.user?.role || 'patient';

  // The first tab for each role — used as the "root" of the back stack
  const initialRouteName =
    role === 'admin'   ? 'admin-dashboard'  :
    role === 'doctor'  ? 'doctor-schedule'  :
                         'home';

  return (
    <Tabs
      initialRouteName={initialRouteName}
      backBehavior="history"
      screenOptions={{ 
        headerShown: true,
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textMuted,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Theme.colors.border,
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
        },
        headerStyle: {
          backgroundColor: Theme.colors.surface,
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: Theme.colors.text,
        }
      }}>
      
      {/* ================= ADMIN TABS ================= */}
      <Tabs.Screen 
        name="admin-dashboard" 
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={24} color={color} />,
          href: role === 'admin' ? '/(tabs)/admin-dashboard' : null
        }} 
      />
      <Tabs.Screen 
        name="admin-registry" 
        options={{ 
          title: 'Registry',
          tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={24} color={color} />,
          href: role === 'admin' ? '/(tabs)/admin-registry' : null
        }} 
      />
      <Tabs.Screen 
        name="admin-appointments" 
        options={{ 
          title: 'Bookings',
          tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} />,
          href: role === 'admin' ? '/(tabs)/admin-appointments' : null
        }} 
      />

      {/* ================= DOCTOR TABS ================= */}
      <Tabs.Screen 
        name="doctor-schedule" 
        options={{ 
          title: 'Schedule',
          tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={24} color={color} />,
          href: role === 'doctor' ? '/(tabs)/doctor-schedule' : null
        }} 
      />
      <Tabs.Screen 
        name="doctor-records" 
        options={{ 
          title: 'Records',
          tabBarIcon: ({ color }) => <Ionicons name="folder-open-outline" size={24} color={color} />,
          href: null
        }} 
      />

      {/* ================= PATIENT TABS ================= */}
      <Tabs.Screen 
        name="home" 
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={24} color={color} />,
          href: role === 'patient' ? '/(tabs)/home' : null
        }} 
      />
      <Tabs.Screen 
        name="doctors" 
        options={{ 
          title: 'Doctors',
          tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={24} color={color} />,
          href: role === 'patient' ? '/(tabs)/doctors' : null
        }} 
      />
      <Tabs.Screen 
        name="appointments" 
        options={{ 
          title: 'Bookings',
          tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} />,
          href: role === 'patient' ? '/(tabs)/appointments' : null
        }} 
      />

      {/* ================= COMMON TABS ================= */}
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
          href: '/(tabs)/profile'
        }} 
      />

      {/* ================= HIDDEN ROUTING SCREENS ================= */}
      <Tabs.Screen name="admin-patients" options={{ href: null, title: 'Patients'  }} />
      <Tabs.Screen name="admin-doctors" options={{ href: null, title: 'Doctors' }} />
      <Tabs.Screen name="admin-departments" options={{ href: null, title: 'Departments' }} />
      <Tabs.Screen name="admin-billing" options={{ href: null, title: 'Billing & Payment' }} />
      <Tabs.Screen name="patient-history" options={{ href: null, title: 'Medical History & Records' }} />
      <Tabs.Screen name="patient-billing" options={{ href: null, title: 'Billing & Payment' }} />

    </Tabs>
  );
}
