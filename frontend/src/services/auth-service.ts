import { http } from './http';
import type { AuthResponse } from '../types/auth';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload extends LoginPayload {
  name: string;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await http.post<AuthResponse>('/auth/register', payload);
  return response.data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await http.post<AuthResponse>('/auth/login', payload);
  return response.data;
}
