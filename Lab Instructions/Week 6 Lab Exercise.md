### Lab Exercise: Integrating and Converting Kafka Workloads with Azure Event Hubs  
   
#### Objective:  
This lab exercise aims to provide hands-on experience in integrating an existing Kafka workload with Azure Event Hubs and converting an existing Kafka workload to use Azure Event Hubs only. The exercise will use Docker Compose, NodeJS, Express.js, and Angular for all the projects. Additional challenges and context are provided to ensure the exercise lasts approximately 4 hours.  
   
### Part 1: Integrating an Existing Kafka Workload with Azure Event Hubs  
   
#### Prerequisites:  
- An active Azure subscription  
- Docker and Docker Compose installed  
- Node.js and npm installed  
- Basic knowledge of Kafka and Azure Event Hubs  
   
#### Step 1: Setting Up Azure Event Hub  
1. **Log in to the Azure Portal:**  
   - Open your web browser and navigate to the [Azure Portal](https://portal.azure.com/).  
   - Log in with your Azure account credentials.  
   
2. **Create a New Event Hubs Namespace:**  
   - In the Azure Portal, click on "Create a resource" and search for "Event Hubs."  
   - Click on "Event Hubs" and then click "Create."  
   - Fill in the required details:  
     - Subscription: Select your subscription.  
     - Resource Group: Create a new resource group or select an existing one.  
     - Namespace Name: Enter a unique name for your Event Hubs namespace.  
     - Location: Select the region closest to your users.  
     - Pricing Tier: Choose the appropriate pricing tier based on your needs.  
   - Click "Review + create" and then "Create."  
   
3. **Create an Event Hub within the Namespace:**  
   - Once the namespace is created, navigate to it in the Azure Portal.  
   - Click on "Event Hubs" under the "Entities" section.  
   - Click "Create" to create a new Event Hub.  
   - Enter a name for your Event Hub and configure the number of partitions (e.g., 4 partitions).  
   - Click "Create."  
   
#### Step 2: Setting Up Kafka with Docker Compose  
1. **Create a `docker-compose.yml` file:**  
   ```yaml  
    version: '3.8'
    services:
      zookeeper:
        image: wurstmeister/zookeeper:latest
        ports:
          - "2181:2181"
      kafka:
        image: wurstmeister/kafka:latest
        ports:
          - "9092:9092"
          - "9093:9093"
        environment:
          KAFKA_LISTENERS: INSIDE://0.0.0.0:9092,OUTSIDE://0.0.0.0:9093
          KAFKA_ADVERTISED_LISTENERS: INSIDE://kafka:9092,OUTSIDE://localhost:9093
          KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: INSIDE:PLAINTEXT,OUTSIDE:PLAINTEXT
          KAFKA_INTER_BROKER_LISTENER_NAME: INSIDE
          KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock
   ```  
   
2. **Start Kafka and Zookeeper:**  
   ```bash  
   docker-compose pull
   docker-compose up -d  
   docker-compose logs kafka
   ```  
   
#### Step 3: Creating Event Producers and Consumers with NodeJS  
1. **Initialize a new NodeJS project:**  
   ```bash  
   mkdir kafka-eventhub-integration  
   cd kafka-eventhub-integration  
   npm init -y  
   ```  
   
2. **Install required packages:**  
   ```bash  
   npm install express kafka-node @azure/event-hubs  
   ```  
   
3. **Create an Express.js application (`app.js`):**  
   ```javascript  
   const express = require('express');  
   const kafka = require('kafka-node');  
   const { EventHubProducerClient } = require('@azure/event-hubs');  
  
   const app = express();  
   const port = 3000;  
  
   const kafkaClient = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });  
   const producer = new kafka.Producer(kafkaClient);  
  
   const connectionString = '<< CONNECTION STRING >>';  
   const eventHubName = '<< EVENT HUB NAME >>';  
   const eventHubProducer = new EventHubProducerClient(connectionString, eventHubName);  
  
   app.get('/send', async (req, res) => {  
     const payloads = [{ topic: 'test', messages: 'Hello Kafka' }];  
     producer.send(payloads, async (err, data) => {  
       if (err) {  
         console.error('Error sending to Kafka:', err);  
         res.status(500).send('Error sending to Kafka');  
       } else {  
         console.log('Sent to Kafka:', data);  
         const batch = await eventHubProducer.createBatch();  
         batch.tryAdd({ body: 'Hello Event Hub' });  
         await eventHubProducer.sendBatch(batch);  
         res.send('Sent to Kafka and Event Hub');  
       }  
     });  
   });  
  
   app.listen(port, () => {  
     console.log(`Server running at http://localhost:${port}/`);  
   });  
   ```  
   
4. **Run the application:**  
   ```bash  
   node app.js  
   ```  
   
5. **Test the integration:**  
   - Open your web browser and navigate to `http://localhost:3000/send` to send events to Kafka and Azure Event Hub.  
   
#### Challenge 1: Implement Error Handling and Logging  
- Enhance the NodeJS application to include comprehensive error handling and logging mechanisms.  
- Use a logging library like `opentelemetry-js`  and Application Insights to log errors and important events.  

   
#### Challenge 2: Implement a Kafka Consumer  
- Create a Kafka consumer in the NodeJS application to consume messages from the Kafka topic.  
- Log the consumed messages to the console and a file.  
- Ensure that the consumer can handle errors gracefully.  
   
### Part 2: Converting an Existing Kafka Workload to Use Azure Event Hubs Only  
   
#### Step 1: Modify the Producer to Use Only Azure Event Hubs  
1. **Update the Express.js application (`app.js`):**  
   ```javascript  
   const express = require('express');  
   const { EventHubProducerClient } = require('@azure/event-hubs');  
  
   const app = express();  
   const port = 3000;  
  
   const connectionString = '<< CONNECTION STRING >>';  
   const eventHubName = '<< EVENT HUB NAME >>';  
   const producer = new EventHubProducerClient(connectionString, eventHubName);  
  
   app.get('/send', async (req, res) => {  
     const batch = await producer.createBatch();  
     batch.tryAdd({ body: 'Hello Event Hub' });  
     await producer.sendBatch(batch);  
     res.send('Sent to Event Hub');  
   });  
  
   app.listen(port, () => {  
     console.log(`Server running at http://localhost:${port}/`);  
   });  
   ```  
   
2. **Run the updated application:**  
   ```bash  
   node app.js  
   ```  
   
3. **Test the conversion:**  
   - Open your web browser and navigate to `http://localhost:3000/send` to send events to Azure Event Hub only.  
   
#### Challenge 3: Implement a Consumer for Azure Event Hubs  
- Create a consumer in the NodeJS application to consume messages from Azure Event Hubs.  
- Log the consumed messages to the console and a file.  
- Ensure that the consumer can handle errors gracefully.  
   
#### Challenge 4: Implement Data Transformation  
- Modify the producer to include additional data fields in the messages sent to Azure Event Hubs.  
- Implement data transformation logic in the consumer to process and transform the received messages.  
- Log the transformed messages to the console and a file.  
   
### Part 3: Creating an Angular Frontend to Visualize Events  
   
#### Step 1: Set Up Angular Project  
1. **Create a new Angular project:**  
   ```bash  
   ng new eventhub-frontend  
   cd eventhub-frontend  
   ```  
   
2. **Install required packages:**  
   ```bash  
   npm install @azure/event-hubs  
   ```  
   
3. **Create a service to interact with Azure Event Hubs (`src/app/eventhub.service.ts`):**  
   ```typescript  
   import { Injectable } from '@angular/core';  
   import { EventHubConsumerClient } from '@azure/event-hubs';  
  
   @Injectable({  
     providedIn: 'root'  
   })  
   export class EventHubService {  
     private connectionString = '<< CONNECTION STRING >>';  
     private eventHubName = '<< EVENT HUB NAME >>';  
     private consumerGroup = '$Default';  
     private consumerClient: EventHubConsumerClient;  
  
     constructor() {  
       this.consumerClient = new EventHubConsumerClient(this.consumerGroup, this.connectionString, this.eventHubName);  
     }  
  
     async receiveEvents() {  
       const subscription = this.consumerClient.subscribe({  
         processEvents: async (events, context) => {  
           for (const event of events) {  
             console.log(`Received event: ${event.body}`);  
           }  
         },  
         processError: async (err, context) => {  
           console.error(`Error: ${err}`);  
         }  
       });  
     }  
   }  
   ```  
   
4. **Create a component to display events (`src/app/event-list/event-list.component.ts`):**  
   ```typescript  
   import { Component, OnInit } from '@angular/core';  
   import { EventHubService } from '../eventhub.service';  
  
   @Component({  
     selector: 'app-event-list',  
     templateUrl: './event-list.component.html',  
     styleUrls: ['./event-list.component.css']  
   })  
   export class EventListComponent implements OnInit {  
     events: any[] = [];  
  
     constructor(private eventHubService: EventHubService) {}  
  
     ngOnInit(): void {  
       this.eventHubService.receiveEvents().then(events => {  
         this.events = events;  
       });  
     }  
   }  
   ```  
   
5. **Update the component template (`src/app/event-list/event-list.component.html`):**  
   ```html  
   <div *ngFor="let event of events">  
     <p>{{ event.body }}</p>  
   </div>  
   ```  
   
6. **Add the component to the main application template (`src/app/app.component.html`):**  
   ```html  
   <app-event-list></app-event-list>  
   ```  
   
7. **Run the Angular application:**  
   ```bash  
   ng serve  
   ```  
   
8. **Open the application in your browser:**  
   - Navigate to `http://localhost:4200` to view the events received from Azure Event Hubs.  
   
#### Challenge 5: Implement Real-Time Updates  
- Modify the Angular application to display events in real-time as they are received from Azure Event Hubs.  
- Use Angular's change detection mechanism to update the UI dynamically.  
   
#### Challenge 6: Implement Filtering and Searching  
- Add filtering and searching capabilities to the Angular application to allow users to filter and search through the received events.  
- Implement a search bar and filter options in the UI.  
   
### Conclusion  
By completing this lab exercise, you have learned how to integrate an existing Kafka workload with Azure Event Hubs, convert a Kafka workload to use Azure Event Hubs only, and create an Angular frontend to visualize events. The additional challenges provide further opportunities to enhance your skills in error handling, data transformation, real-time updates, and UI development. This exercise covers key concepts such as setting up Azure Event Hubs, using Docker Compose for Kafka, and developing applications with NodeJS, Express.js, and Angular.