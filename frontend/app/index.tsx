import { Redirect } from 'expo-router';
import { useAuth } from '../store/auth-context';

export default function IndexScreen() {
  const { isAuthenticated } = useAuth();
  return <Redirect href={isAuthenticated ? '/(tabs)/home' : '/(auth)/login'} />;
}
