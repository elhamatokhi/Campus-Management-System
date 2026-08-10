import {
  getCurrentUserPlaceholder,
  loginUserPlaceholder,
  registerUserPlaceholder,
  updateCurrentUserPlaceholder,
} from '../services/userService.js';

export function registerUser(request, response) {
  const result = registerUserPlaceholder(request.body);
  response.status(501).json(result);
}

export function loginUser(request, response) {
  const result = loginUserPlaceholder(request.body);
  response.status(501).json(result);
}

export function getCurrentUser(request, response) {
  const result = getCurrentUserPlaceholder();
  response.status(501).json(result);
}

export function updateCurrentUser(request, response) {
  const result = updateCurrentUserPlaceholder(request.body);
  response.status(501).json(result);
}

