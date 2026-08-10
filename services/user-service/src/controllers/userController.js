import {
  getCurrentUserRecord,
  loginUserRecord,
  registerUserRecord,
  updateCurrentUserRecord,
} from '../services/userService.js';

export async function registerUser(request, response) {
  const user = await registerUserRecord(request.body);
  response.status(201).json({ success: true, data: user });
}

export async function loginUser(request, response) {
  const result = await loginUserRecord(request.body);
  response.status(200).json({ success: true, data: result });
}

export async function getCurrentUser(request, response) {
  const user = await getCurrentUserRecord(request.user.id);
  response.status(200).json({ success: true, data: user });
}

export async function updateCurrentUser(request, response) {
  const user = await updateCurrentUserRecord(request.user.id, request.body);
  response.status(200).json({ success: true, data: user });
}
