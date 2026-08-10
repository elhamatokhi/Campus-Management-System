const phaseMessage =
  'User Service route is available, but database persistence and JWT authentication will be implemented in a later phase.';

export function registerUserPlaceholder(payload) {
  return {
    success: false,
    message: phaseMessage,
    endpoint: 'POST /api/users/register',
    receivedFields: Object.keys(payload || {}),
  };
}

export function loginUserPlaceholder(payload) {
  return {
    success: false,
    message: phaseMessage,
    endpoint: 'POST /api/users/login',
    receivedFields: Object.keys(payload || {}),
  };
}

export function getCurrentUserPlaceholder() {
  return {
    success: false,
    message: phaseMessage,
    endpoint: 'GET /api/users/me',
  };
}

export function updateCurrentUserPlaceholder(payload) {
  return {
    success: false,
    message: phaseMessage,
    endpoint: 'PUT /api/users/me',
    receivedFields: Object.keys(payload || {}),
  };
}

