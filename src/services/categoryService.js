import { request } from './apiClient';

export function listCategories() {
  return request('/categories');
}

export function getCategory(id) {
  return request(`/categories/${id}`);
}

export function createCategory(payload) {
  return request('/categories', { method: 'POST', body: payload });
}

export function updateCategory(id, payload) {
  return request(`/categories/${id}`, { method: 'PUT', body: payload });
}

export function deleteCategory(id) {
  return request(`/categories/${id}`, { method: 'DELETE' });
}


