const express = require('express');
const Kafka = require('node-rdkafka');
const cors = require('cors'); // Import the cors middleware

const app = express();
const port = 3001; // Use a different port for the consumer service

app.use(cors()); // Enable CORS for all routes

const stream = Kafka.KafkaConsumer.createReadStream({
  'metadata.broker.list': 'mynamespace.servicebus.windows.net:9093', // Replace with your FQDN
  'group.id': 'nodejs-cg', // The default consumer group for Event Hubs is $Default
  'socket.keepalive.enable': true,
  'enable.auto.commit': false,
  'security.protocol': 'SASL_SSL',
  'sasl.mechanisms': 'PLAIN',
  'sasl.username': '$ConnectionString', // Do not replace $ConnectionString
  'sasl.password': 'Endpoint=sb://mynamespace.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=XXXXX' // Replace with your connection string
}, {}, {
  topics: 'MyKafkaTopic', // Replace with your topic name
  waitInterval: 0,
  objectMode: false
});

let messages = [];

stream.on('data', (data) => {
  console.log(`Received message: ${data.toString()}`);
  messages.push(data.toString());
});

stream.on('error', (err) => {
  console.error('Stream error:', err);
  process.exit(1);
});

stream.consumer.on('event.error', (err) => {
  console.error('Consumer error:', err);
});

app.get('/messages', (req, res) => {
  res.json(messages);
});

app.listen(port, () => {
  console.log(`Consumer service running at http://localhost:${port}`);
});