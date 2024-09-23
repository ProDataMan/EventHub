### Exercise: Integrating Apache Kafka with Azure Event Hubs using Node.js

#### Objective:
By the end of this exercise, students will be able to:
1. Create an Azure Event Hubs namespace and enable Kafka endpoint.
2. Configure a Kafka producer using Express.js to send messages to the Event Hub.
3. Configure a Kafka consumer using Angular to receive messages from the Event Hub.

#### Prerequisites:
- An active Azure subscription.
- Node.js installed.
- OpenSSL installed.
- Git installed.

#### Step-by-Step Instructions:

### Step 1: Create an Azure Event Hubs Namespace

1. **Navigate to the Azure Portal:**
   - Open your web browser and go to the [Azure Portal](https://portal.azure.com/).

2. **Create a New Event Hubs Namespace:**
   - In the left-hand menu, select **Create a resource**.
   - In the **Search the Marketplace** box, type **Event Hubs** and select **Event Hubs** from the list.
   - Click **Create**.
   - Fill in the required fields:
     - **Subscription:** Select your Azure subscription.
     - **Resource group:** Create a new resource group or select an existing one.
     - **Namespace name:** Enter a unique name for your Event Hubs namespace.
     - **Location:** Select the region closest to you.
     - **Pricing tier:** Select **Standard** or **Premium** based on your requirements.
   - Click **Review + create** and then **Create**.

3. **Enable Kafka on Event Hubs:**
   - Once the namespace is created, navigate to the namespace in the Azure portal.
   - In the left-hand menu, select **Settings** then **Properties**.
   - Ensure that the **Kafka** feature is enabled.

4. **Create an Event Hub Instance:**
   - In the Event Hubs namespace, select **Event Hubs** under **Entities**.
   - Click **+ Event Hub** to create a new Event Hub instance.
   - Enter the name **test** for the Event Hub and click **Create**.

5. **Retrieve Connection String and FQDN:**
   - Navigate to the **Shared access policies** section in the Event Hubs namespace.
   - Select the **RootManageSharedAccessKey** policy and copy the **Connection string–primary key**.
   - Extract the FQDN from the connection string (e.g., `mynamespace.servicebus.windows.net`).

### Step 2: Create a new Project

1. **Create project directory:**
   - Open a terminal or command prompt.
   - Run the following command to create the directory:
     ```bash
     mkdir azure-event-hubs-project
     cd azure-event-hubs-project
     ```

### Step 3: Configure Kafka Producer using Express.js

1. **Install Dependencies:**
   - Run the following command to install the required dependencies:
     ```bash
     npm init -y
     npm install express node-rdkafka cors
     ```

2. **Create Producer Script:**
   - Create a new file named `producer.js` in the `azure-event-hubs-project` folder.
   - Add the following code to `producer.js`:
     ```javascript
     const express = require('express');
     const Kafka = require('node-rdkafka');
     const cors = require('cors');

     const app = express();
     const port = 3000;

     app.use(cors());

     const producer = new Kafka.Producer({
       'metadata.broker.list': 'mynamespace.servicebus.windows.net:9093', // Replace with your FQDN
       'security.protocol': 'SASL_SSL',
       'sasl.mechanisms': 'PLAIN',
       'sasl.username': '$ConnectionString',
       'sasl.password': 'Endpoint=sb://mynamespace.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=XXXXXX' // Replace with your connection string
     });

     producer.on('ready', () => {
       console.log('Producer is ready');
     });

     producer.on('event.error', (err) => {
       console.error('Error from producer:', err);
     });

     producer.connect();

     app.get('/send', (req, res) => {
       const message = Buffer.from('Hello Kafka');
       producer.produce('MyKafkaTopic', null, message, null, Date.now());
       res.send('Message sent to Kafka');
     });

     app.listen(port, () => {
       console.log(`Producer app listening at http://localhost:${port}`);
     });
     ```

3. **Run the Producer:**
   - In the terminal, run the following command to start the producer:
     ```bash
     node producer.js
     ```

4. **Send Messages:**
   - Open your web browser and navigate to `http://localhost:3000/send`.
   - This will send a message to the Kafka-enabled Event Hub on the topic [`MyKafkaTopic`].

### Step 4: Configure Kafka Consumer using Angular

1. **Create Angular Application:**
   - Open a terminal and run the following commands to create a new Angular application:
     ```bash
     ng new kafka-consumer
     cd kafka-consumer
     ```


2. **Create Consumer Service:**
   - Add the `provideHttpClient` to `src/app/app.config.ts`
   - Create a new file named `kafka-consumer.service.ts` in the `src/app` folder.
   - Add the following code to `kafka-consumer.service.ts`:
     ```typescript
     import { Injectable } from '@angular/core';
     import { HttpClient } from '@angular/common/http';
     import { Observable } from 'rxjs';

     @Injectable({
       providedIn: 'root'
     })
     export class KafkaConsumerService {

       constructor(private http: HttpClient) { }

       getMessages(): Observable<any> {
         return this.http.get('http://localhost:3001/messages'); // Updated port to match the consumer service
       }
     }
     ```

3. **Create Consumer Server:**
   - Create a new file named `service.js` in the `azure-event-hubs-project` folder.
   - Add the following code to `service.js`:
     ```javascript
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
        'sasl.password': 'Endpoint=sb://KafkaConsumer.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=XXXXXX' // Replace with your connection string
        }, {}, {
        topics: 'MyKafkaTopic', // Replace with your topic name
        waitInterval: 0,
        objectMode: false
        });
        
        let messages = [];
        
        stream.on('data', (data) => {
        console.log(`Received message: ${data.value.toString()}`);
        messages.push(data.value.toString());
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
     ```

4. **Run the Consumer Server:**
   - In the terminal, run the following command to start the consumer server:
     ```bash
     node service.js
     ```

5. **Use Consumer Service in Component:**
   - Open `src/app/app.component.ts` and modify it to use the KafkaConsumerService:
     ```typescript
     import { Component, OnInit } from '@angular/core';
     import { KafkaConsumerService } from './kafka-consumer.service';

     @Component({
       selector: 'app-root',
       templateUrl: './app.component.html',
       styleUrls: ['./app.component.css']
     })
     export class AppComponent implements OnInit {
       title = 'kafka-consumer';
       messages: string[] = [];

       constructor(private kafkaConsumerService: KafkaConsumerService) {}

       ngOnInit() {
         this.kafkaConsumerService.getMessages().subscribe(
           (data: string[]) => {
             this.messages = data;
           },
           (error) => {
             console.error('Error fetching messages:', error);
           }
         );
       }
     }
     ```

6. **Update the Template to Display Messages:**
   - Open `src/app/app.component.html` and add the following code to display the messages:
     ```html
     <div>
       <h1>{{ title }}</h1>
       <h2>Kafka Messages</h2>
       <ul>
         <li *ngFor="let message of messages">{{ message }}</li>
       </ul>
     </div>
     ```

7. **Run the Angular Application:**
   - In the terminal, run the following command to start the Angular application:
     ```bash
     ng serve
     ```

8. **Verify Message Reception:**
   - Open your web browser and navigate to `http://localhost:4200`.
   - Check the console for received messages from the Kafka-enabled Event Hub.

### Conclusion:
- You have successfully integrated Apache Kafka with Azure Event Hubs using Node.js.
- This exercise demonstrated how to create an Event Hubs namespace, configure a Kafka producer using Express.js, and configure a Kafka consumer using Angular.