import api from './api';

export interface Claim {
  id: number;
  claimNumber: string;
  patientName: string;
  serviceDate: string;
  amount: number;
  status: string;
  facilityId: number;
  payerId: number;
}

export interface Facility {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  active: boolean;
}

export interface Payer {
  id: number;
  name: string;
  code: string;
  type: string;
  active: boolean;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export const dataService = {
  // Claims
  async getClaims(params?: any): Promise<{ claims: Claim[]; total: number }> {
    const response = await api.get('/claims', { params });
    return response.data;
  },

  async getClaimById(id: number): Promise<Claim> {
    const response = await api.get(`/claims/${id}`);
    return response.data;
  },

  async createClaim(data: Partial<Claim>): Promise<Claim> {
    const response = await api.post('/claims', data);
    return response.data;
  },

  async updateClaim(id: number, data: Partial<Claim>): Promise<Claim> {
    const response = await api.put(`/claims/${id}`, data);
    return response.data;
  },

  async deleteClaim(id: number): Promise<void> {
    await api.delete(`/claims/${id}`);
  },

  // Facilities
  async getFacilities(params?: any): Promise<Facility[]> {
    const response = await api.get('/facilities', { params });
    return response.data;
  },

  async getFacilityById(id: number): Promise<Facility> {
    const response = await api.get(`/facilities/${id}`);
    return response.data;
  },

  async createFacility(data: Partial<Facility>): Promise<Facility> {
    const response = await api.post('/facilities', data);
    return response.data;
  },

  async updateFacility(id: number, data: Partial<Facility>): Promise<Facility> {
    const response = await api.put(`/facilities/${id}`, data);
    return response.data;
  },

  async deleteFacility(id: number): Promise<void> {
    await api.delete(`/facilities/${id}`);
  },

  // Payers
  async getPayers(params?: any): Promise<Payer[]> {
    const response = await api.get('/payers', { params });
    return response.data;
  },

  // Users (Admin only)
  async getUsers(params?: any): Promise<User[]> {
    const response = await api.get('/users', { params });
    return response.data;
  },

  async getUserById(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async createUser(data: Partial<User>): Promise<User> {
    const response = await api.post('/users', data);
    return response.data;
  },

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
