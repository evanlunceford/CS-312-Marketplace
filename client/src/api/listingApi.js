import { httpClient } from './httpClient.js';

export const listingApi = {
  getAll: async () => {
    const response = await httpClient.get('/listings');
    return response.data;
  },
  getById: async (id) => {
    const response = await httpClient.get(`/listings/${id}`);
    return response.data;
  },
  create: async (listingData) => {
    const response = await httpClient.post('/listings', listingData);
    return response.data;
  },
  update: async (id, listingData) => {
    const response = await httpClient.put(`/listings/${id}`, listingData);
    return response.data;
  },
  delete: async (id) => {
    const response = await httpClient.delete(`/listings/${id}`);
    return response.data;
  }
};
