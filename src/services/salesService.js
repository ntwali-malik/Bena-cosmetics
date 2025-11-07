import { request } from './apiClient';

export function listSales() {
  return request('/sales');
}

export function getNextInvoiceNumber() {
  return request('/sales/next-invoice');
}

export function getSale(id) {
  return request(`/sales/${id}`);
}

export function createSale(payload) {
  return request('/sales', { method: 'POST', body: payload });
}

export function updateSale(id, payload) {
  return request(`/sales/${id}`, { method: 'PUT', body: payload });
}

export function deleteSale(id) {
  return request(`/sales/${id}`, { method: 'DELETE' });
}


