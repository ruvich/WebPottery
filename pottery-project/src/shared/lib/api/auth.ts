import axios from 'axios';

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export const login = async (data: LoginData): Promise<LoginResponse> => {
  const response = await axios.post('/api/auth/login', data);
  return response.data;
};