import axiosClient from './axiosClient';

export const getProperties = () => {
  return axiosClient.get('/properties');
};

export const getPropertyById = (id) => {
  return axiosClient.get(`/properties/${id}`);
};

export const createProperty = (data) => {
  return axiosClient.post('/properties', data);
};

export const updateProperty = (id, data) => {
  return axiosClient.put(`/properties/${id}`, data);
};

export const deleteProperty = (id) => {
  return axiosClient.delete(`/properties/${id}`);
};
