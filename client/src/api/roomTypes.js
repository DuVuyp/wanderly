import axiosClient from './axiosClient';

export const createRoomType = (propertyId, data) => {
  return axiosClient.post(`/properties/${propertyId}/room-types`, data);
};

export const getRoomTypes = (propertyId) => {
  return axiosClient.get(`/properties/${propertyId}/room-types`);
};
