import axiosClient from './axiosClient';

export const getProfile = async () => {
  const response = await axiosClient.get('/profile');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await axiosClient.put('/profile', data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await axiosClient.put('/profile/change-password', data);
  return response.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await axiosClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
