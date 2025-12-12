# Auto Policy System

A complete auto insurance policy management demo application designed for Salesforce/MuleSoft Financial Services solutions engineering. This system provides a React web frontend, Node.js/Express backend, RESTful APIs, and Swagger documentation.

## Features

- **Full CRUD Operations**: Create, read, update, and delete policies, drivers, and vehicles
- **Many-to-Many Relationships**: Policies can have multiple drivers and vehicles
- **In-Memory Datastore**: Fast, demo-friendly data storage (resets on restart)
- **Swagger Documentation**: Complete API documentation at `/docs`
- **Demo Reset**: Reset all data to initial seed state with one click
- **Professional UI**: Clean, responsive interface suitable for prospect demonstrations

## Technology Stack

- **Frontend**: React 18, Vite, React Router v6, CSS Modules
- **Backend**: Node.js 20.x, Express 4.x
- **API Documentation**: Swagger/OpenAPI 3.0.3
- **Deployment**: Heroku-ready

## Project Structure

```
auto-policy-system/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express app entry point
│   │   ├── datastore.js          # In-memory data store
│   │   ├── seedData.js           # Seed data generation
│   │   ├── routes/               # API route handlers
│   │   ├── middleware/           # Express middleware
│   │   └── utils/                # Utility functions
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Main app component
│   │   ├── components/            # React components
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── services/              # API client
│   │   └── styles/                # Global styles
│   └── package.json
├── package.json                   # Root package.json
├── Procfile                       # Heroku deployment
└── README.md
```

## Prerequisites

- Node.js 20.x LTS
- npm 10.x
- Git
- Heroku CLI (for deployment)

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auto-policy-system
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend && npm install && cd ..

   # Install frontend dependencies
   cd frontend && npm install && cd ..
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api/v1
   - Swagger UI: http://localhost:3001/docs

## Production Build

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

   The Express server will serve the static React build on port 3001 (or PORT environment variable).

## Heroku Deployment

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create a new Heroku app** (if needed)
   ```bash
   heroku create auto-policy-demo
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

4. **Open the app**
   ```bash
   heroku open
   ```

The `heroku-postbuild` script in `package.json` will automatically build the frontend during deployment.

## API Endpoints

### Drivers
- `GET /api/v1/drivers` - Get all drivers
- `GET /api/v1/drivers/:id` - Get a specific driver
- `POST /api/v1/drivers` - Create a new driver
- `PUT /api/v1/drivers/:id` - Update a driver
- `DELETE /api/v1/drivers/:id` - Delete a driver

### Vehicles
- `GET /api/v1/vehicles` - Get all vehicles
- `GET /api/v1/vehicles/:id` - Get a specific vehicle
- `POST /api/v1/vehicles` - Create a new vehicle
- `PUT /api/v1/vehicles/:id` - Update a vehicle
- `DELETE /api/v1/vehicles/:id` - Delete a vehicle

### Policies
- `GET /api/v1/policies` - Get all policies (with optional filters: status, driverId, vehicleId)
- `GET /api/v1/policies/:id` - Get a specific policy with drivers and vehicles
- `POST /api/v1/policies` - Create a new policy
- `PUT /api/v1/policies/:id` - Update a policy
- `DELETE /api/v1/policies/:id` - Delete a policy

### Policy-Driver Management
- `POST /api/v1/policies/:id/drivers` - Add a driver to a policy
- `DELETE /api/v1/policies/:id/drivers/:driverId` - Remove a driver from a policy
- `PUT /api/v1/policies/:id/drivers/:driverId` - Replace a driver on a policy

### Policy-Vehicle Management
- `POST /api/v1/policies/:id/vehicles` - Add a vehicle to a policy
- `DELETE /api/v1/policies/:id/vehicles/:vehicleId` - Remove a vehicle from a policy
- `PUT /api/v1/policies/:id/vehicles/:vehicleId` - Replace a vehicle on a policy

### Utilities
- `GET /api/v1/health` - Health check endpoint
- `POST /api/v1/demo/reset` - Reset all data to initial seed state

## Seed Data

The system automatically generates seed data on startup:
- **75 Drivers**: 50 primary drivers + 25 family members
- **85 Vehicles**: Mix of makes/models with realistic distribution
- **50 Policies**: One policy per primary driver with relationships

Seed data aligns with bankingcoredemo customer patterns for consistency across demo systems.

## Data Model

### Driver
- Personal information (name, date of birth)
- License information (number, state, expiration)
- Driving record (points, accidents)

### Vehicle
- Vehicle information (year, make, model)
- Registration (VIN, license plate, state)

### Policy
- Address information
- Coverage details (premium, policy value)
- Dates (effective, termination)
- Status (ACTIVE, PENDING, CANCELLED, EXPIRED)
- Relationships to drivers and vehicles

## Notes

- **In-Memory Storage**: All data is stored in memory and resets when the server restarts
- **No Authentication**: This is a demo system without authentication/authorization
- **Demo Reset**: Use the "Reset Demo Data" button in the header to restore initial seed data

## License

MIT

## Author

Howie Rothstein

