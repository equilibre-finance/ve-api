# Èquilibre Data Processing Service

This repository contains a Node.js application that simplifies the retrieval and processing of data from the Kava blockchain. The application leverages Redis, a powerful in-memory data store, to provide fast and efficient storage for the processed data.

## Features

  - Data Retrieval: The application interacts with the Kava blockchain using web3.js, fetching data related to veNFTs, pool gauges, and voting escrow contracts.
  - Data Processing: Once the data is retrieved, it undergoes processing operations such as time calculations, statistical analysis, and filtering based on user-defined parameters.
  - Redis Caching: The processed data is stored in Redis, ensuring quick access and reducing the load on the blockchain.
  - API Endpoints: The application exposes a set of RESTful API endpoints to access the processed data. Users can query specific endpoints to retrieve the desired information.
  - Batched Calls: To optimize performance and reduce network load, the application utilizes batched calls, allowing multiple data requests to be combined into a single call.
  - Error Handling: Robust error handling mechanisms are implemented to handle failed blockchain calls and retry them after a specific delay.
    
## API Endpoints

The following API endpoints are available:

- `/api/v1/info`: Returns general information about the current state of the data processor, including the processed block number, current epoch timestamp, and event counts for Deposit, Withdraw, and Transfer.

- `/api/v1/oracle`: Retrieves data from a hypothetical oracle contract, such as price, circulating supply, market cap, and more.

- `/api/v1/veapi`: Fetches information from a VE (Voting Escrow) API contract, providing details like timestamp, price, circulating supply, liquidity, etc.

- `/api/v1/deposit/:epoch`, `/api/v1/withdraw/:epoch`, `/api/v1/transfer/:epoch`: Returns Deposit, Withdraw, and Transfer events that occurred in the specified epoch.

- `/api/v1/all/:epoch`: Aggregates Deposit, Withdraw, and Transfer events for a specific epoch.

- `/api/v1/nftByAddress/:address`: Retrieves all NFTs held by a given Ethereum address.

- `/api/v1/allHoldersBalance`: Provides balance information for all token holders.

- `/api/v1/gaugeInfo`: Returns a detailed summary of all pool gauges, including their addresses, symbols, and fees.

- `/api/v1/gauges`: Retrieves the current list of pool gauges.

## Dependencies

The project relies on the following dependencies:

- Express.js: Utilized for creating the server and defining API endpoints.
- Web3.js: Employed for interacting with the Ethereum blockchain.
- Moment.js: Used for handling dates and time-related operations.
- Node.js `crypto` library: Enables cryptographic functions, such as calculating hashes.
- Node.js `fs` library: Facilitates file system operations.

## Setup and Usage

To use this application, ensure that Node.js and npm are installed on your system. Clone the repository and install the necessary dependencies using `npm install`.

Configure the Kava RPC node and the addresses of the smart contracts you wish to interact with by setting the appropriate environment variables. Start the server by running `node index.js`.

## Disclaimer

**Ownership**: This API is developed and owned by Èquilibre. All intellectual property rights related to the API belong to Èquilibre. However, Èquilibre grants the community permission to use, modify, and distribute the API in accordance with the terms of the applicable open-source license.

**No Warranty**: The application is provided on an "as-is" basis, without any warranties or guarantees of any kind, either expressed or implied. Èquilibre does not make any representations or warranties regarding the accuracy, functionality, or performance of the application.

**Limitation of Liability**: Èquilibre shall not be held liable for any direct, indirect, incidental, consequential, or special damages arising out of or in connection with the use or inability to use the application, even if Èquilibre has been advised of the possibility of such damages.

**User Responsibility**: Users of the API are solely responsible for any consequences resulting from its use. It is the users' responsibility to ensure the compatibility of the application with their devices and to take necessary precautions to protect their data and systems.

**Security and Privacy**: While Èquilibre takes reasonable measures to ensure the security and privacy of the application, it cannot guarantee the absolute security of transmitted or stored data. Users are advised to exercise caution and implement their own security measures.

**Third-Party Content**: The API may include links or references to third-party websites, services, or content. Èquilibre does not endorse or assume any responsibility for the availability, accuracy, or content of such third-party resources.
