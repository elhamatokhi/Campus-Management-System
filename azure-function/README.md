# Azure Function

Queue-triggered serverless processing for booking notifications in the Campus Event Management System.

This function is intentionally separate from the Booking Service. The Booking Service remains responsible for creating, listing, and cancelling bookings. The Azure Function handles asynchronous post-booking notification processing after a booking has already been created.

## Function

- Name: `bookingNotificationProcessor`
- Runtime: Node.js
- Programming model: Azure Functions Node.js v4
- Trigger: Azure Storage Queue
- Queue name setting: `BOOKING_NOTIFICATION_QUEUE`
- Default queue name: `booking-notifications`
- Storage connection setting: `AzureWebJobsStorage`
- Queue message encoding: plain text JSON, configured with `messageEncoding: "none"` in `host.json`

## Message Contract

Expected queue message:

```json
{
  "bookingId": "booking-id",
  "eventId": "event-id",
  "eventTitle": "Cybersecurity Workshop",
  "userEmail": "student@example.com",
  "userName": "Alex",
  "status": "CONFIRMED",
  "createdAt": "2026-08-12T10:00:00.000Z"
}
```

Required fields:

- `bookingId`
- `eventId`
- `eventTitle`
- `userEmail`
- `status`
- `createdAt`

Do not include passwords, JWTs, database credentials, or unnecessary personal data in queue messages.

## Behavior

When a queue message arrives, the function:

1. Parses and validates the JSON payload.
2. Logs a safe notification-processing summary.
3. Completes successfully.

It does not send real email yet. That can be added later without changing the booking workflow.

Invalid messages throw an error after logging a safe diagnostic message. Azure Functions queue retry behavior handles retries according to `host.json`.

## Local Prerequisites

- Node.js 20 or newer
- npm
- Azure Functions Core Tools v4
- Azurite or another Azure Storage-compatible local development storage service

Install Azure Functions Core Tools separately if it is not already available:

```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

Azurite can be installed separately or run from your preferred local setup:

```bash
npm install -g azurite
```

Do not commit local storage connection strings or secrets.

## Local Configuration

Create a local settings file from the example:

```bash
cp local.settings.example.json local.settings.json
```

For Azurite, the default example uses:

```json
{
  "AzureWebJobsStorage": "UseDevelopmentStorage=true",
  "FUNCTIONS_WORKER_RUNTIME": "node",
  "BOOKING_NOTIFICATION_QUEUE": "booking-notifications"
}
```

`local.settings.json` is ignored by the repository root `.gitignore`. Keep real storage connection strings out of Git.

## Install

From the repository root:

```bash
npm install -w azure-function
```

Or from this directory:

```bash
npm install
```

## Test

Unit tests do not require a live queue:

```bash
npm test -w azure-function
```

## Run Locally

Start Azurite in one terminal:

```bash
azurite
```

Start the Azure Functions host in another terminal:

```bash
npm start -w azure-function
```

Then add a JSON message to the `booking-notifications` queue using Azure Storage Explorer, Azure CLI, or another local queue tool.

The local queue message should be sent as plain JSON text, not manually Base64 encoded.

## Future Booking Service Integration

The future integration point is after `createBookingRecord` successfully creates a booking in:

```text
services/booking-service/src/services/bookingService.js
```

Conceptual flow:

```text
booking created successfully
-> construct queue message
-> enqueue booking-notifications message
-> return booking response normally
```

The booking operation should not move booking business rules into the Function. Notification queueing should be treated as asynchronous post-booking processing.

## Future Azure Deployment

Later deployment will require:

1. Create or choose an Azure Storage account.
2. Create the `booking-notifications` queue.
3. Create an Azure Function App using Node.js.
4. Configure Function App settings:
   - `AzureWebJobsStorage`
   - `FUNCTIONS_WORKER_RUNTIME=node`
   - `BOOKING_NOTIFICATION_QUEUE=booking-notifications`
5. Deploy this `azure-function/` project.
6. Configure Booking Service to enqueue notification messages after successful booking creation.
