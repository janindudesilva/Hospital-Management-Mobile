import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'hms_mobile_session';

export const saveAuthStorage = async (session: any) => {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const getStoredSession = async () => {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const clearAuthStorage = async () => {
  await AsyncStorage.removeItem(SESSION_KEY);
};

export const getToken = async () => {
  const session = await getStoredSession();
  return session?.token || null;
};
