### Exercise: Sending Data from JavaScript  
1. **Prerequisites**:   
   - Ensure you have an active Azure subscription.  
   - Ensure you have an existing Azure resource group.  
   - Ensure Node.js is installed on your machine.  
   - Ensure Azure CLI is installed and configured on your machine.  
   - Ensure you have the ExpressJS backend application from Week 3 Containerization ready and executable.  
   
2. **Step 1: Log in to Azure CLI**  
   - Open a terminal or command prompt on your machine.  
   - Run the following command:  
     ```sh  
     az login  
     ```  
   - Follow the instructions to complete the login process. This will open a web browser where you can enter your Azure credentials.  
   
3. **Step 2: Set Up an Event Hub**  
   - **Create an Event Hub Namespace**:  
     ```sh  
     az eventhubs namespace create --name YourNamespaceName --resource-group YourResourceGroup --location YourLocation  
     ```  
   - **Create an Event Hub**:  
     ```sh  
     az eventhubs eventhub create --name YourEventHubName --namespace-name YourNamespaceName --resource-group YourResourceGroup  
     ```  
   - **Get the Connection String**:  
     ```sh  
     az eventhubs namespace authorization-rule keys list --resource-group YourResourceGroup --namespace-name YourNamespaceName --name RootManageSharedAccessKey  
     ```  
   - Note down the `primaryConnectionString` from the output.  
   
4. **Step 3: Install JavaScript SDK Packages**  
   - Open a terminal and navigate to your express-server project root directory.  
   - Run the following command to install the Azure Event Hubs SDK:  
     ```sh  
     npm install @azure/event-hubs  
     ``` 
   
5. **Step 4: Update your Express-JS Application**  
   - **Import the Azure Event Hubs SDK**:  
     ```js  
     const { EventHubProducerClient } = require('@azure/event-hubs');  
     ```  
   - **Initialize the Event Hub Producer Client** using the connection string you noted earlier:  
     ```js  
     const connectionString = 'YourEventHubConnectionString';  
     const eventHubName = 'YourEventHubName';  
     const producer = new EventHubProducerClient(connectionString, eventHubName);  
     ```
   
### Exercise: Test the Integration  
1. **Start Your Express Application**:  
   - Run the following command to start your Express application:  
     ```sh  
     node index.js  
     ```  
2. **Send a POST Request**:  
   - Use a tool like PowerShell or Postman to send a POST request:  
     ```ps  
     $headers = @{  
         Content-Type = "application/json"  
     }  
  
     $body = @{  
         studentName = "John Doe"  
         subject = "Math"  
         grade = "A"  
     } | ConvertTo-Json  
  
     Invoke-WebRequest -Uri http://localhost:4000/api/grades -Method POST -Headers $headers -Body $body  
     ``` 
   
### Exercise: Monitor the Events  
1. **Monitor with the Event Hubs Data Explorer**:  
   - Go to the Azure Portal and open your event hubs namespace.  
   - From the namespace, select your event hub.  
   - Select Data Explorer to open the data explorer