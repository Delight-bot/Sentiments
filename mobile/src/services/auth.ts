import api from './api';

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    hasVoiceStory?: boolean;
  };
  token: string;
}

interface SignupResponse {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  token: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const signup = async (
  email: string,
  password: string,
  name?: string
): Promise<SignupResponse> => {
  const response = await api.post('/auth/signup', { email, password, name });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data.user;
};

export const logout = async () => {
  await api.post('/auth/logout');
};
