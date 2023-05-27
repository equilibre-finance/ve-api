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

- `/stats`: (HTML) Provides information about veVARA and VARA oracle price.
- `/api/v1/stats`: (JSON) Provides information about veVARA and VARA oracle price.
- `/api/v1/price/0x7d8100072ba0e4da8dc6bd258859a5dc1a452e05`: (JSON) Provides price information from a pool.
- `/api/v1/info`: (JSON) Returns information about the ve-api service, such as block and data counts.
- `/info`: (HTML) Returns information about the ve-API service, such as block and data counts.
- `/api/v1/deposit/0`: (JSON) Returns information about each deposit in the specified epoch (0 refers to the last epoch).
- `/api/v1/withdraw/0`: (JSON) Returns information about each withdrawal in the specified epoch (0 refers to the last epoch).
- `/api/v1/transfer/0`: (JSON) Returns information about each transfer in the specified epoch (0 refers to the last epoch).
- `/api/v1/all/0`: (JSON) Returns information about all transactions in the contract.

### Navigation

- `limit`: Used to determine the number of results to return (e.g., `?limit=10000`).
- `offset`: Used to navigate through the results (e.g., `?offset=0` returns the first 10,000 results, `?offset=1` returns results from 10,001 to 20,000).
- `epoch`: Used to filter data by epoch number (e.g., `?epoch=10` to get data from epoch 10).

### Advanced Filters

You can apply advanced filters to customize the data retrieval based on specific criteria. The filter follows the format `?q[field][operand]=value`, and you can pass multiple filters by including multiple `q` parameters in the URL.

Examples:
- `?q[address][eq][0xAf79312EB821871208ac76A80c8E282f8796964e]`: Filters all data by address.
- `?q[days][gt][1000]`: Filters all data by the `days` field greater than 1000 days.
- Multiple filters: `?q[address][eq][0xAf79312EB821871208ac76A80c8E282f8796964e]&q[days][gt][1000]` combines the two filters mentioned above.

For more information about the available filter operands, please refer to the [array-query documentation](https://github.com/jacwright/array-query).
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
