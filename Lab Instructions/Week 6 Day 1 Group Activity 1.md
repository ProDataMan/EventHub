### Group Activity: Building a Real-Time Dashboard with Azure Event Hub and Express

#### Objective

In this group activity, you will extend their knowledge from the previous exercise by building a real-time dashboard that displays data sent to Azure Event Hub. The dashboard will be created using an Express application and a front-end framework of their choice (e.g., React, Angular, or Vue.js). The goal is to visualize the data in real-time as it is received from the Event Hub.

#### Prerequisites

1. **Completion of the Previous Exercise**: Ensure that all students have completed the previous exercise of sending data to Azure Event Hub from an Express application.
2. **Basic Knowledge of Front-End Frameworks**: Students should have a basic understanding of a front-end framework (React, Angular, or Vue.js).

#### Instructions

1. **Form Groups**: Divide the students into groups of 3-4 members.

2. **Set Up the Project**:
   - Each group should create a new directory for the project.
   - Initialize a new Node.js project in the directory:
     ```bash
     npm init -y
     ```

3. **Install Required Packages**:
   - Install the necessary packages for the Express application and the front-end framework:
     ```bash
     npm install express @azure/event-hubs socket.io
     ```

4. **Create the Express Application**:
   - Create a new file named `server.js` and add the following code to set up the Express server and Socket.IO for real-time communication:
     ```javascript
     const express = require('express');
     const http = require('http');
     const socketIo = require('socket.io');
     const { EventHubConsumerClient } = require('@azure/event-hubs');

     const app = express();
     const server = http.createServer(app);
     const io = socketIo(server);

     const connectionString = 'YourEventHubConnectionString';
     const eventHubName = 'YourEventHubName';
     const consumerGroup = '$Default'; // The default consumer group

     // Create a consumer client for the event hub
     const consumerClient = new EventHubConsumerClient(consumerGroup, connectionString, eventHubName);

     // Define a function to process events
     const processEvents = async (events, context) => {
       for (const event of events) {
         io.emit('newEvent', event.body);
       }
     };

     // Define a function to handle errors
     const processError = async (err, context) => {
       console.error(`Error: ${err.message}`);
     };

     // Subscribe to the event hub
     consumerClient.subscribe({
       processEvents,
       processError
     });

     // Serve the front-end application
     app.use(express.static('public'));

     // Handle process exit
     process.on('SIGINT', async () => {
       await consumerClient.close();
       process.exit();
     });

     const PORT = process.env.PORT || 5000;
     server.listen(PORT, () => {
       console.log(`Server is running on port ${PORT}`);
     });
     ```

5. **Create the Front-End Application**:
   - Each group should choose a front-end framework (React, Angular, or Vue.js) and set up a basic project.
   - Create a simple dashboard that connects to the Socket.IO server and displays the received events in real-time.

   Example for Angular:

   **Create a new Angular project**:
   ```bash
   npx @angular/cli new dashboard
   cd dashboard
   npm install socket.io-client
   ```

   **Update `src/app/app.module.ts`** to import `HttpClientModule`:

   **Update `src/app/app.component.ts`** to include the socket.io-client logic:
   ```typescript
   import { Component, OnInit, OnDestroy } from '@angular/core';
   import { io } from 'socket.io-client';

   const ENDPOINT = "http://localhost:5000";

   @Component({
     selector: 'app-root',
     templateUrl: './app.component.html',
     styleUrls: ['./app.component.css']
   })
   export class AppComponent implements OnInit, OnDestroy {
     events: any[] = [];
     private socket: any;

     ngOnInit() {
       this.socket = io(ENDPOINT);
       this.socket.on('newEvent', (data: any) => {
         this.events.push(data);
       });
     }

     ngOnDestroy() {
       if (this.socket) {
         this.socket.disconnect();
       }
     }
   }
   ```

   **Update `src/app/app.component.html`** to display the events:
   ```html
   <div class="App">
     <h1>Real-Time Dashboard</h1>
     <ul>
       <li *ngFor="let event of events; let i = index">
         {{ event | json }}
       </li>
     </ul>
   </div>
   ```




6. **Run the Application**:
   - Start the Express server:
     ```bash
     node server.js
     ```
   - Start the Angular application:
     ```bash
     ng serve
     ```

7. **Test the Real-Time Dashboard**:
   - Use the POST request method from the previous exercise to send data to the Event Hub.
   - Verify that the data is displayed in real-time on the dashboard.

#### Discussion Points

1. **Challenges Faced**: Discuss any challenges faced during the implementation and how they were overcome.
2. **Real-Time Data Processing**: Talk about the importance of real-time data processing and its applications.
3. **Scalability**: Discuss how the solution can be scaled to handle a larger volume of events.

#### Deliverables

1. **Code Repository**: Each group should create a repository on GitHub or any other version control platform and push their code.
2. **Presentation**: Prepare a short presentation to demonstrate the real-time dashboard and explain the implementation.

