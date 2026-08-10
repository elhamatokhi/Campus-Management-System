import { apiRequest } from './apiClient.js';

export function registerUser(payload) {
  return apiRequest('user', '/api/users/register', {
    method: 'POST',
    body: payload,
  });
}

export function loginUser(payload) {
  return apiRequest('user', '/api/users/login', {
    method: 'POST',
    body: payload,
  });
}

export function getProfile(token) {
  return apiRequest('user', '/api/users/me', { token });
}

export function updateProfile(token, payload) {
  return apiRequest('user', '/api/users/me', {
    method: 'PUT',
    token,
    body: payload,
  });
}

