import axiosClient from './axiosClient';

export const createRoom = (roomTypeId, data) => {
  return axiosClient.post(`/room-types/${roomTypeId}/rooms`, data);
};

export const updateRoom = (roomId, data) => {
  return axiosClient.put(`/rooms/${roomId}`, data);
};

export const deleteRoom = (roomId) => {
  return axiosClient.delete(`/rooms/${roomId}`);
};
