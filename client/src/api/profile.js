import axiosClient from './axiosClient';

export const getProfile = async () => {
  return await axiosClient.get('/profile');
};

export const updateProfile = async (data) => {
  return await axiosClient.put('/profile', data);
};

export const changePassword = async (data) => {
  return await axiosClient.put('/profile/change-password', data);
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return await axiosClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
