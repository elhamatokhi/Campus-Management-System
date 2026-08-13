# Azure Function

Queue-triggered serverless processing for booking notifications in the Campus Management System.

The Function is intentionally separate from the Booking Service. The Booking Service remains responsible for booking persistence and business rules; the Function handles asynchronous post-booking notification processing after a booking has already been created.

## Function

- Name: `bookingNotificationProcessor`
- Runtime: Node.js
- Programming model: Azure Functions Node.js v4
- Trigger: Azure Storage Queue
- Queue name setting: `BOOKING_NOTIFICATION_QUEUE`
- Default queue name: `booking-notifications`
- Storage connection setting: `AzureWebJobsStorage`
- Queue message encoding: plain text JSON, configured with `messageEncoding: "none"` in `host.json`
- Entrypoint: `src/index.js`

## Runtime Flow

```text
Booking Service
-> publish booking notification JSON
-> Azure Storage Queue booking-notifications
-> bookingNotificationProcessor
-> validate and log notification-processing summary
```

The Function currently does not send real email and does not create visible frontend notifications.

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

When a queue message arrives, the Function:

1. Parses and validates the JSON payload.
2. Logs a safe notification-processing summary.
3. Completes successfully.

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

Azurite is available as a workspace dev dependency and can be started with `npx`:

```bash
npx azurite
```

## Local Configuration

Create a local settings file from the example:

```bash
cd azure-function
cp local.settings.example.json local.settings.json
```

For Azurite, the example uses:

```json
{
  "AzureWebJobsStorage": "UseDevelopmentStorage=true",
  "FUNCTIONS_WORKER_RUNTIME": "node",
  "BOOKING_NOTIFICATION_QUEUE": "booking-notifications"
}
```

`local.settings.json` is ignored by Git. Keep real storage connection strings out of source control.

## Install And Test

From the repository root:

```bash
npm install -w azure-function
npm test -w azure-function
```

Unit tests do not require a live queue.

## Run Locally

Start Azurite in one terminal:

```bash
npx azurite
```

Start the Azure Functions host in another terminal:

```bash
npm start -w azure-function
```

Then add a plain JSON message to the `booking-notifications` queue using Azure Storage Explorer, Azure CLI, or a small local queue-sender script. The local queue message should be sent as plain JSON text, not manually Base64 encoded.

Successful execution appears in the Functions host output as:

```text
Executed 'Functions.bookingNotificationProcessor' (Succeeded, ...)
```

## Azure Deployment Notes

The deployed Function App must have these application settings:

```text
AzureWebJobsStorage=<function-storage-connection-string>
BOOKING_NOTIFICATION_QUEUE=booking-notifications
```

For the Node.js v4 programming model, `package.json` uses:

```json
"main": "src/index.js"
```

`src/index.js` imports the queue-trigger registration module so Azure can discover `bookingNotificationProcessor` after deployment.
