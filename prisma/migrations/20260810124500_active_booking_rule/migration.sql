DROP INDEX IF EXISTS "Booking_userId_eventId_key";
CREATE INDEX "Booking_userId_eventId_idx" ON "Booking"("userId", "eventId");

