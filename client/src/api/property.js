import axiosClient from './axiosClient';

export const getAllProperties = (params) => {
  return axiosClient.get('/properties', { params });
};

export const getPropertyById = (id) => {
  return axiosClient.get(`/properties/${id}`);
};

export const getPropertyRoomTypes = (id) => {
  return axiosClient.get(`/properties/${id}/room-types`);
};
