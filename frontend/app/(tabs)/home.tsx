import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Theme } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/auth-context';

export default function HomeScreen() {
  const { session } = useAuth();
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome back,</Text>
        <Text style={styles.name}>{session?.user?.fullName || 'User'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <View style={styles.grid}>
        <ActionCard 
          title="Find Doctors" 
          subtitle="Book experts"
          icon="medical" 
          color="#0f766e"
          onPress={() => router.push('/(tabs)/doctors')} 
        />
        <ActionCard 
          title="Appointments" 
          subtitle="Manage visits"
          icon="calendar" 
          color="#0891b2"
          onPress={() => router.push('/(tabs)/appointments')} 
        />
      </View>

      <View style={styles.banner}>
        <Ionicons name="information-circle" size={24} color="#fff" />
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>Stay Safe</Text>
          <Text style={styles.bannerSub}>Check our latest health guidelines in the portal.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function ActionCard({ title, subtitle, icon, color, onPress }: any) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={28} color={color} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSub}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: 20 },
  header: { marginBottom: 28, marginTop: 10 },
  welcome: { fontSize: 16, color: Theme.colors.textMuted },
  name: { fontSize: 28, fontWeight: '800', color: Theme.colors.text },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    width: '48%', 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconContainer: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Theme.colors.text, marginBottom: 4 },
  cardSub: { fontSize: 12, color: Theme.colors.textMuted },
  banner: { 
    backgroundColor: Theme.colors.primary, 
    flexDirection: 'row', 
    padding: 20, 
    borderRadius: 20, 
    alignItems: 'center',
    marginTop: 10 
  },
  bannerText: { marginLeft: 16 },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  bannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 }
});
