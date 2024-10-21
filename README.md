# Seacloud API Client

An unoffical, fully typed client library for the Seacloud API.

## Installation

```bash
npm install seacloud-client
```

## Usage

```typescript
import { SeacloudClient } from 'seacloud-api-client';

// Create a new client
const client = new SeacloudClient();

// Authenticate with the Seacloud API using your username and password
client.authenticate('username', 'password');

// Get all locations
const locations = await client.getLocations();
```

## Documentation

See the [Seacloud API documentation](https://seacloud.io/docs/api) for more information on the API endpoints and response types.
Only a subset of the API is currently supported:

- Authenticate
- Locations
- Sensors

Contributions are welcome!
