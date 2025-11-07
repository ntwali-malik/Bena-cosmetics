import { request } from './apiClient';

export function listProductions() {
  return request('/production');
}

export function getProduction(id) {
  return request(`/production/${id}`);
}

export function createProduction(payload) {
  return request('/production', { method: 'POST', body: payload });
}

export function updateProduction(id, payload) {
  return request(`/production/${id}`, { method: 'PUT', body: payload });
}

export function deleteProduction(id) {
  return request(`/production/${id}`, { method: 'DELETE' });
}


