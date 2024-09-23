import { Injectable } from '@angular/core';
import { EventHubConsumerClient, ReceivedEventData } from '@azure/event-hubs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventHubService {
  private connectionString = '<eventhub-connection-string>';
  private eventHubName = '<eventhub-name>';
  private consumerGroup = '$Default';
  private consumerClient: EventHubConsumerClient;

  constructor() {
    this.consumerClient = new EventHubConsumerClient(this.consumerGroup, this.connectionString, this.eventHubName);
  }

  receiveEvents(): Observable<ReceivedEventData> {
    return new Observable(observer => {
      const subscription = this.consumerClient.subscribe({
        processEvents: async (receivedEvents, context) => {
          console.log(`Received ${receivedEvents.length} events`);
          for (const event of receivedEvents) {
            console.log('Event received:', event);
            observer.next(event);
          }
        },
        processError: async (err, context) => {
          console.error('Error processing events:', err);
          observer.error(err);
        }
      });

      // Cleanup on unsubscribe
      return () => {
        subscription.close();
      };
    });
  }
}