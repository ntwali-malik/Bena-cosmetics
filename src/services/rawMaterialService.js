import { request } from './apiClient';

export function listRawMaterials() {
  return request('/raw-materials');
}

export function getRawMaterial(id) {
  return request(`/raw-materials/${id}`);
}

export function createRawMaterial(payload) {
  return request('/raw-materials', { method: 'POST', body: payload });
}

export function updateRawMaterial(id, payload) {
  return request(`/raw-materials/${id}`, { method: 'PUT', body: payload });
}

export function deleteRawMaterial(id) {
  return request(`/raw-materials/${id}`, { method: 'DELETE' });
}


