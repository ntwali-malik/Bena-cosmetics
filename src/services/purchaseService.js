import { request } from './apiClient';

export function listPurchases() {
  return request('/purchases');
}

export function getPurchase(id) {
  return request(`/purchases/${id}`);
}

export function createPurchase(payload) {
  return request('/purchases', { method: 'POST', body: payload });
}

export function updatePurchase(id, payload) {
  return request(`/purchases/${id}`, { method: 'PUT', body: payload });
}

export function deletePurchase(id) {
  return request(`/purchases/${id}`, { method: 'DELETE' });
}


