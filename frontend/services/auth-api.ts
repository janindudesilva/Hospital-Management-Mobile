import { api } from './api';

export const authApi = {
  register: (payload: { fullName: string; email: string; password: string; phone?: string; role?: string }) =>
    api.post('/auth/register', payload),
  login: (payload: { email: string; password: string }) => api.post('/auth/login', payload)
};
