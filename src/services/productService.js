import { request } from './apiClient';

export function listProducts() {
  return request('/products');
}

export function getProduct(id) {
  return request(`/products/${id}`);
}

export function createProduct(payload) {
  return request('/products', { method: 'POST', body: payload });
}

export function updateProduct(id, payload) {
  return request(`/products/${id}`, { method: 'PUT', body: payload });
}

export function deleteProduct(id) {
  return request(`/products/${id}`, { method: 'DELETE' });
}


