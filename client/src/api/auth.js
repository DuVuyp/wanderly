import axiosClient from './axiosClient';

export const login = (data) => {
  return axiosClient.post('/auth/login', data);
};

export const register = (data) => {
  return axiosClient.post('/auth/register', data);
};

export const getMe = () => {
  return axiosClient.get('/auth/me');
};

export const logout = () => {
  return axiosClient.post('/auth/logout');
};
