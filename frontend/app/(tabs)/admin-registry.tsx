import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Theme } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

export default function AdminRegistry() {
  const menuItems = [
    {
      title: 'Patient Management',
      subtitle: 'Profiles, history, IDs & records',
      icon: 'people',
      color: '#4F46E5',
      route: '/(tabs)/admin-patients'
    },
    {
      title: 'Doctor Management',
      subtitle: 'Schedules, availability & specialties',
      icon: 'medical',
      color: '#10B981',
      route: '/(tabs)/admin-doctors'
    },
    {
      title: 'Department Management',
      subtitle: 'Units, assignments & resources',
      icon: 'business',
      color: '#F59E0B',
      route: '/(tabs)/admin-departments'
    }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Hospital Operations</Text>
      <Text style={styles.subtitle}>Select a category to manage records</Text>

      <View style={styles.grid}>
        {menuItems.map((item, index) => (
          <Pressable 
            key={index} 
            style={styles.card} 
            onPress={() => router.push(item.route as any)}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon as any} size={28} color={item.color} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Theme.colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: Theme.colors.text, marginTop: 10 },
  subtitle: { fontSize: 15, color: Theme.colors.textMuted, marginBottom: 24, marginTop: 4 },
  grid: { gap: 16 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: Theme.colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  iconContainer: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Theme.colors.text },
  cardSubtitle: { fontSize: 13, color: Theme.colors.textMuted, marginTop: 2 },
});
