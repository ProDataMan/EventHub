const express = require('express');
const kafka = require('kafka-node');
const { EventHubProducerClient } = require('@azure/event-hubs');
const appInsights = require('applicationinsights');
const logger = require('./logger');
require('./tracing'); // Import the tracing configuration

const app = express();
const port = 3000;

const kafkaClient = new kafka.KafkaClient({ kafkaHost: 'localhost:9093' });
const producer = new kafka.Producer(kafkaClient);

const connectionString = '<event_hub_connection_string>';
const eventHubName = '<event_hub_name>';
const eventHubProducer = new EventHubProducerClient(connectionString, eventHubName);

// Initialize Application Insights client
const client = appInsights.defaultClient;

producer.on('ready', () => {
  console.log('Kafka Producer is connected and ready.');
  client.trackEvent({ name: 'KafkaProducerReady' });
  logger.info('Kafka Producer is connected and ready.');
});

producer.on('error', (err) => {
  console.error('Error in Kafka Producer:', err);
  client.trackException({ exception: err });
  logger.error(`Error in Kafka Producer: ${err.message}`);
});

app.get('/send', async (req, res) => {
  const payloads = [{ topic: 'test', messages: 'Hello Kafka' }];
  producer.send(payloads, async (err, data) => {
    if (err) {
      console.error('Error sending to Kafka:', err);
      client.trackException({ exception: err });
      logger.error(`Error sending to Kafka: ${err.message}`);
      res.status(500).send('Error sending to Kafka');
    } else {
      console.log('Sent to Kafka:', data);
      client.trackEvent({ name: 'SentToKafka', properties: { data } });
      logger.info(`Sent to Kafka: ${JSON.stringify(data)}`);
      try {
        const batch = await eventHubProducer.createBatch();
        batch.tryAdd({ body: 'Hello Event Hub' });
        await eventHubProducer.sendBatch(batch);
        client.trackEvent({ name: 'SentToEventHub' });
        logger.info('Sent to Event Hub');
        res.send('Sent to Kafka and Event Hub');
      } catch (eventHubError) {
        console.error('Error sending to Event Hub:', eventHubError);
        client.trackException({ exception: eventHubError });
        logger.error(`Error sending to Event Hub: ${eventHubError.message}`);
        res.status(500).send('Error sending to Event Hub');
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  client.trackEvent({ name: 'ServerStarted', properties: { port } });
  logger.info(`Server running at http://localhost:${port}/`);
});