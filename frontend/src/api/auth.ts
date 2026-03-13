import { api } from './client';

interface AuthResponse {
  token: string;
  username: string;
}

export const authApi = {
  login: (username: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { username, password }),

  register: (username: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { username, email, password }),

  me: () => api.get<{ id: number; username: string; email: string }>('/auth/me'),
};
