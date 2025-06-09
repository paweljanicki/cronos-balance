# Cronos Balance API

A Node.js API service that provides balance information for Cronos blockchain addresses. This service includes rate limiting, Redis caching, and uses the official Crypto.com Developer Platform SDK.

## Features

- Fetch Cronos balances for a spcified wallet/token address
- Rate limiting to prevent API abuse
- Redis caching for improved performance
- Integration with Crypto.com Developer Platform SDK
- TypeScript support

## Prerequisites

- Node.js (v22 or higher)
- Redis server (local or cloud-based)
- Cronos Explorer API key (get it from [Cronos Explorer](https://explorer-api-doc.cronos.org/mainnet/))

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd cronos-balance
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

4. Configure the environment variables in `.env`:

```env
PORT=3000                                   # Port for the API server
RATE_LIMIT_WINDOW_MS=600000                 # Rate limit window in milliseconds
RATE_LIMIT_MAX_REQUESTS=100                 # Maximum requests per window
CRONOS_EXPLORER_API_KEY=                    # Your Cronos Explorer API key (MAINNET)
API_KEYS=key1,key2,key3                     # Comma-separated list of API keys for authentication
REDIS_USERNAME=                             # Redis username
REDIS_PASSWORD=                             # Redis password
REDIS_HOST=                                 # Redis host address (can be local or cloud-based)
REDIS_PORT=                                 # Redis port
REDIS_TTL=60                                # Redis cache TTL in seconds
```

Make sure that your Cronos Explorer API key is for the Mainnet, as by default the app is configured to get balances for Cronos EVM Mainnet.

## Development

To run the server in development mode with hot-reload:

```bash
npm run dev
```

## Building

To build the TypeScript project:

```bash
npm run build
```

## Production

To start the server in production mode:

```bash
npm start
```

## Running with Docker

This starts the app in the production mode and is not intended to be used for development

### Prerequisites

- Docker installed on your system
- `.env` file configured with all required environment variables

### Building the Docker Image

```bash
docker build -t cronos-balance .
```

### Running the Container

```bash
docker run -p 3000:3000 --env-file .env cronos-balance
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## API Usage

The API provides endpoints to fetch balance information for Cronos addresses. All requests require an API key to be included in the headers. Make sure to replace "your-api-key" with an actual key you specified in the .env file

### Get CRO balance of the specified wallet address:

Replace the {address} with a wallet address

```bash
curl -X GET http://localhost:3000/balance/{address} \
  -H "X-API-Key: your-api-key"
```

### Get CRC20 token balance for the address:

Replace the {address} with a wallet address and {tokenAddress} with a CRC20 token address

```bash
curl -X GET http://localhost:3000/token-balance/{address}/{tokenAddress} \
  -H "X-API-Key: your-api-key"
```

## Rate Limiting

The API implements rate limiting to prevent abuse. By default, it allows 100 requests per 10-minute window per API KEY. These limits can be adjusted in the `.env` file.

## Caching

The service uses Redis for caching responses to improve performance and reduce load on the Cronos Explorer API. Cache TTL can be configured in the `.env` file.

## Potential improvments

- Error handling and logging (currently some error details are lost in the process, in order not to expose them to the client, but they should still be logged)
- Add Swagger documentation
- More comprehensive unit and integration tests
- Health check endpoint

## License

ISC

## Author

Pawel Janicki
