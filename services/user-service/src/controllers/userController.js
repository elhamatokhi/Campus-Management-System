import {
  getCurrentUserRecord,
  loginUserPending,
  registerUserRecord,
  updateCurrentUserRecord,
} from '../services/userService.js';

export async function registerUser(request, response) {
  const user = await registerUserRecord(request.body);
  response.status(201).json({ success: true, data: user });
}

export function loginUser(request, response) {
  const result = loginUserPending(request.body);
  response.status(501).json(result);
}

export async function getCurrentUser(request, response) {
  const user = await getCurrentUserRecord(request.query);
  response.status(200).json({ success: true, data: user });
}

export async function updateCurrentUser(request, response) {
  const user = await updateCurrentUserRecord(request.query, request.body);
  response.status(200).json({ success: true, data: user });
}
