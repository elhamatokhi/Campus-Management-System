import assert from 'node:assert/strict';
import test from 'node:test';

process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

const { signAuthToken, verifyAuthToken } = await import('./authService.js');

test('signAuthToken creates a token that verifyAuthToken can read', () => {
  const token = signAuthToken({
    id: 'user-1',
    email: 'student@campus.test',
    role: 'STUDENT',
    name: 'Student User',
  });

  const user = verifyAuthToken(token);

  assert.equal(user.id, 'user-1');
  assert.equal(user.email, 'student@campus.test');
  assert.equal(user.role, 'STUDENT');
});

test('verifyAuthToken rejects invalid tokens', () => {
  assert.throws(() => verifyAuthToken('not-a-token'), /Invalid or expired token/);
});

