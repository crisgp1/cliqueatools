# amortization-service

amortization-service microservice for Cliquéalo.mx automotive credit simulator

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (>= 16.x)
- npm (>= 8.x)

### Installing

```bash
npm install
```

### Running

```bash
npm start
```

## Development

```bash
npm run dev
```

## Running the tests

```bash
npm test
```

## Architecture

This service follows hexagonal architecture combined with Domain-Driven Design principles:

- **Domain**: Core business logic, entities, value objects
- **Application**: Use cases, application services
- **Infrastructure**: External services integration, repositories implementation
- **Interface**: Controllers, API endpoints
