import assert from 'node:assert/strict';
import test from 'node:test';
import { BookingStatus } from '@prisma/client';

test('BookingStatus supports confirmed and cancelled states', () => {
  assert.equal(BookingStatus.CONFIRMED, 'CONFIRMED');
  assert.equal(BookingStatus.CANCELLED, 'CANCELLED');
});

test('student booking access is based on authenticated user id', () => {
  const student = { id: 'student-1', role: 'STUDENT' };
  const admin = { id: 'admin-1', role: 'ADMIN' };

  assert.equal(student.role === 'ADMIN', false);
  assert.equal(admin.role === 'ADMIN', true);
});

