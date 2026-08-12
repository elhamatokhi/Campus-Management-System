import { app } from '@azure/functions';
import { processBookingNotification } from '../bookingNotificationProcessor.js';

app.storageQueue('bookingNotificationProcessor', {
  queueName: '%BOOKING_NOTIFICATION_QUEUE%',
  connection: 'AzureWebJobsStorage',
  handler: async (queueItem, context) => {
    context.log('bookingNotificationProcessor invoked');
    context.log('queue item type:', typeof queueItem);

    try {
      await processBookingNotification(queueItem, context);
    } catch (error) {
      context.error('bookingNotificationProcessor failed', {
        name: error?.name,
        message: error?.message,
      });
      throw error;
    }
  },
});
