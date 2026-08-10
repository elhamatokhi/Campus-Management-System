import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

const { requireAuth, requireRole } = await import('./auth.js');

function createResponse() {
  return {};
}

test('requireAuth rejects requests without a Bearer token', () => {
  const request = { get: () => '' };
  const nextCalls = [];

  requireAuth(request, createResponse(), (error) => nextCalls.push(error));

  assert.equal(nextCalls[0].statusCode, 401);
});

test('requireAuth accepts a valid token', () => {
  const token = jwt.sign({ sub: 'admin-1', email: 'admin@test.local', role: 'ADMIN' }, 'test-secret');
  const request = { get: () => `Bearer ${token}` };
  const nextCalls = [];

  requireAuth(request, createResponse(), (error) => nextCalls.push(error));

  assert.equal(nextCalls[0], undefined);
  assert.equal(request.user.id, 'admin-1');
  assert.equal(request.user.role, 'ADMIN');
});

test('requireRole rejects a student for an admin route', () => {
  const request = { user: { id: 'student-1', role: 'STUDENT' } };
  const nextCalls = [];

  requireRole('ADMIN')(request, createResponse(), (error) => nextCalls.push(error));

  assert.equal(nextCalls[0].statusCode, 403);
});

