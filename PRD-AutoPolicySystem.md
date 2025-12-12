# Product Requirements Document: Auto Policy System

**Version:** 1.0  
**Date:** December 11, 2025  
**Author:** Howie Rothstein  
**Status:** Draft  

---

## 1. Executive Summary

The Auto Policy System is a demonstration application designed for Salesforce/MuleSoft Financial Services solutions engineering. It provides a complete auto insurance policy management system with a React web frontend, Node.js/Express backend, RESTful APIs, and Swagger documentation. This system replaces the previously developed Agency Management System (AMS) with a simpler, more focused demo.

The system uses an in-memory datastore (data resets on restart) and requires no authentication, making it ideal for rapid demonstrations and integration showcases.

---

## 2. Project Goals

### Primary Objectives
1. Provide a realistic auto insurance policy management demo for MuleSoft integration scenarios
2. Showcase API-first architecture with full CRUD operations
3. Demonstrate many-to-many relationships (policies ↔ drivers, policies ↔ vehicles)
4. Maintain data consistency with the bankingcoredemo customer base
5. Enable rapid setup and teardown for prospect demonstrations

### Success Criteria
- All CRUD operations functional via API and UI
- Swagger documentation complete and testable
- 50 seed policies aligned with bankingcoredemo customers
- Deployable to Heroku with single command
- Demo reset capability for clean state restoration

---

## 3. Technical Architecture

### 3.1 Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Frontend | React | 18.x |
| Backend | Node.js + Express | 20.x LTS / 4.x |
| Datastore | In-Memory (JavaScript Map/Array) | N/A |
| API Documentation | Swagger/OpenAPI | 3.0 |
| Deployment | Heroku | Current |
| Build Tool | Vite | 5.x |

### 3.2 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         HEROKU DYNO                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │   React Frontend    │    │      Node.js/Express Backend    │ │
│  │   (Static Build)    │    │                                 │ │
│  │                     │    │  ┌───────────────────────────┐  │ │
│  │  ┌───────────────┐  │    │  │    In-Memory Datastore    │  │ │
│  │  │ Policy List   │  │    │  │                           │  │ │
│  │  │ Policy Detail │  │◄──►│  │  drivers: Map<id, Driver> │  │ │
│  │  │ Policy Create │  │    │  │  vehicles: Map<id, Veh>   │  │ │
│  │  │ Driver Mgmt   │  │    │  │  policies: Map<id, Pol>   │  │ │
│  │  │ Vehicle Mgmt  │  │    │  │                           │  │ │
│  │  └───────────────┘  │    │  └───────────────────────────┘  │ │
│  │                     │    │                                 │ │
│  └─────────────────────┘    │  ┌───────────────────────────┐  │ │
│                             │  │      REST API Layer       │  │ │
│                             │  │  /api/v1/drivers          │  │ │
│                             │  │  /api/v1/vehicles         │  │ │
│                             │  │  /api/v1/policies         │  │ │
│                             │  └───────────────────────────┘  │ │
│                             │                                 │ │
│                             │  ┌───────────────────────────┐  │ │
│                             │  │    Swagger UI (/docs)     │  │ │
│                             │  └───────────────────────────┘  │ │
│                             └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Port Configuration

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 3000 | React development server |
| Backend | 3001 | Express API server |
| Production | 3001 | Combined (Express serves static React build) |

---

## 4. Data Model

### 4.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────────┐       ┌─────────────────┐
│     DRIVER      │       │   POLICY_DRIVER     │       │     POLICY      │
├─────────────────┤       │   (Junction Table)  │       ├─────────────────┤
│ id (PK)         │       ├─────────────────────┤       │ id (PK)         │
│ firstName       │◄──────│ driverId (FK)       │──────►│ address         │
│ lastName        │       │ policyId (FK)       │       │ city            │
│ dateOfBirth     │       └─────────────────────┘       │ state           │
│ licenseNumber   │                                     │ zipCode         │
│ licenseState    │                                     │ premium         │
│ licenseExpiration│      ┌─────────────────────┐       │ effectiveDate   │
│ pointsOnLicense │       │   POLICY_VEHICLE    │       │ terminationDate │
│ accidentsCount  │       │   (Junction Table)  │       │ policyValue     │
│ createdAt       │       ├─────────────────────┤       │ status          │
│ updatedAt       │       │ vehicleId (FK)      │──────►│ createdAt       │
└─────────────────┘       │ policyId (FK)       │       │ updatedAt       │
                          └─────────────────────┘       └─────────────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │    VEHICLE      │
                          ├─────────────────┤
                          │ id (PK)         │
                          │ year            │
                          │ make            │
                          │ model           │
                          │ vin             │
                          │ plate           │
                          │ plateState      │
                          │ createdAt       │
                          │ updatedAt       │
                          └─────────────────┘
```

### 4.2 Entity Definitions

#### 4.2.1 Driver Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Auto | Unique identifier |
| firstName | String | Yes | Driver's first name |
| lastName | String | Yes | Driver's last name |
| dateOfBirth | Date (ISO) | Yes | Driver's date of birth |
| licenseNumber | String | Yes | Driver's license number |
| licenseState | String (2) | Yes | State that issued license |
| licenseExpiration | Date (ISO) | Yes | License expiration date |
| pointsOnLicense | Integer (0-10) | Yes | Points on license (last 24 months) |
| accidentsCount | Integer (0-5) | Yes | Number of accidents (last 24 months) |
| createdAt | DateTime | Auto | Record creation timestamp |
| updatedAt | DateTime | Auto | Record update timestamp |

#### 4.2.2 Vehicle Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Auto | Unique identifier |
| year | Integer | Yes | Vehicle model year (1990-2025) |
| make | String | Yes | Vehicle manufacturer |
| model | String | Yes | Vehicle model name |
| vin | String (17) | Yes | Vehicle Identification Number |
| plate | String | Yes | License plate number |
| plateState | String (2) | Yes | State of registration |
| createdAt | DateTime | Auto | Record creation timestamp |
| updatedAt | DateTime | Auto | Record update timestamp |

#### 4.2.3 Policy Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Auto | Unique identifier |
| policyNumber | String | Auto | Human-readable policy number (AUTO-XXXXX) |
| address | String | Yes | Street address |
| city | String | Yes | City |
| state | String (2) | Yes | State |
| zipCode | String (5) | Yes | ZIP code |
| premium | Decimal | Yes | Annual premium amount |
| effectiveDate | Date (ISO) | Yes | Policy start date |
| terminationDate | Date (ISO) | Yes | Policy end date |
| policyValue | Decimal | Yes | Total policy coverage value |
| status | Enum | Yes | ACTIVE, CANCELLED, EXPIRED, PENDING |
| driverIds | Array[UUID] | No | Associated driver IDs |
| vehicleIds | Array[UUID] | No | Associated vehicle IDs |
| createdAt | DateTime | Auto | Record creation timestamp |
| updatedAt | DateTime | Auto | Record update timestamp |

---

## 5. API Specification

### 5.1 Base URL
```
Development: http://localhost:3001/api/v1
Production: https://{heroku-app-name}.herokuapp.com/api/v1
```

### 5.2 Driver APIs

#### GET /drivers
Retrieve all drivers.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "d1a2b3c4-...",
      "firstName": "John",
      "lastName": "Smith",
      "dateOfBirth": "1985-03-15",
      "licenseNumber": "D123456789",
      "licenseState": "NY",
      "licenseExpiration": "2027-03-15",
      "pointsOnLicense": 2,
      "accidentsCount": 0,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "count": 50
}
```

#### GET /drivers/:id
Retrieve a specific driver.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "d1a2b3c4-...",
    "firstName": "John",
    "lastName": "Smith",
    "dateOfBirth": "1985-03-15",
    "licenseNumber": "D123456789",
    "licenseState": "NY",
    "licenseExpiration": "2027-03-15",
    "pointsOnLicense": 2,
    "accidentsCount": 0,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "error": "Driver not found"
}
```

#### POST /drivers
Create a new driver.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "dateOfBirth": "1990-07-22",
  "licenseNumber": "D987654321",
  "licenseState": "CA",
  "licenseExpiration": "2026-07-22",
  "pointsOnLicense": 0,
  "accidentsCount": 0
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "new-uuid-...",
    "firstName": "Jane",
    "lastName": "Doe",
    ...
  }
}
```

#### PUT /drivers/:id
Update an existing driver.

**Request Body:** (partial updates allowed)
```json
{
  "pointsOnLicense": 3,
  "accidentsCount": 1
}
```

**Response 200:**
```json
{
  "success": true,
  "data": { ... updated driver ... }
}
```

#### DELETE /drivers/:id
Delete a driver.

**Response 200:**
```json
{
  "success": true,
  "message": "Driver deleted successfully"
}
```

**Response 400:** (if driver is on active policy)
```json
{
  "success": false,
  "error": "Cannot delete driver associated with active policies",
  "policyIds": ["policy-id-1", "policy-id-2"]
}
```

---

### 5.3 Vehicle APIs

#### GET /vehicles
Retrieve all vehicles.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "v1a2b3c4-...",
      "year": 2022,
      "make": "Toyota",
      "model": "Camry",
      "vin": "1HGBH41JXMN109186",
      "plate": "ABC1234",
      "plateState": "NY",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "count": 75
}
```

#### GET /vehicles/:id
Retrieve a specific vehicle.

#### POST /vehicles
Create a new vehicle.

**Request Body:**
```json
{
  "year": 2023,
  "make": "Honda",
  "model": "Accord",
  "vin": "1HGCV1F34PA012345",
  "plate": "XYZ9876",
  "plateState": "CA"
}
```

#### PUT /vehicles/:id
Update an existing vehicle.

#### DELETE /vehicles/:id
Delete a vehicle.

**Response 400:** (if vehicle is on active policy)
```json
{
  "success": false,
  "error": "Cannot delete vehicle associated with active policies",
  "policyIds": ["policy-id-1"]
}
```

---

### 5.4 Policy APIs

#### GET /policies
Retrieve all policies.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | String | Filter by status (ACTIVE, CANCELLED, EXPIRED, PENDING) |
| driverId | UUID | Filter by driver |
| vehicleId | UUID | Filter by vehicle |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "p1a2b3c4-...",
      "policyNumber": "AUTO-00001",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "premium": 1200.00,
      "effectiveDate": "2025-01-01",
      "terminationDate": "2026-01-01",
      "policyValue": 50000.00,
      "status": "ACTIVE",
      "drivers": [
        {
          "id": "d1a2b3c4-...",
          "firstName": "John",
          "lastName": "Smith",
          ...
        }
      ],
      "vehicles": [
        {
          "id": "v1a2b3c4-...",
          "year": 2022,
          "make": "Toyota",
          "model": "Camry",
          ...
        }
      ],
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "count": 50
}
```

#### GET /policies/:id
Retrieve a specific policy with full driver and vehicle details.

#### POST /policies
Create a new policy.

**Request Body:**
```json
{
  "address": "456 Oak Ave",
  "city": "Los Angeles",
  "state": "CA",
  "zipCode": "90001",
  "premium": 1500.00,
  "effectiveDate": "2025-02-01",
  "terminationDate": "2026-02-01",
  "policyValue": 75000.00,
  "driverIds": ["driver-uuid-1", "driver-uuid-2"],
  "vehicleIds": ["vehicle-uuid-1"]
}
```

#### PUT /policies/:id
Update policy details (not drivers/vehicles - use specific endpoints).

#### DELETE /policies/:id
Delete a policy.

---

### 5.5 Policy-Driver Management APIs

#### POST /policies/:id/drivers
Add a driver to a policy.

**Request Body:**
```json
{
  "driverId": "driver-uuid"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": { ... updated policy with new driver ... }
}
```

#### DELETE /policies/:id/drivers/:driverId
Remove a driver from a policy.

**Response 200:**
```json
{
  "success": true,
  "data": { ... updated policy ... }
}
```

#### PUT /policies/:id/drivers/:driverId
Replace a driver on a policy with another driver.

**Request Body:**
```json
{
  "newDriverId": "new-driver-uuid"
}
```

---

### 5.6 Policy-Vehicle Management APIs

#### POST /policies/:id/vehicles
Add a vehicle to a policy.

**Request Body:**
```json
{
  "vehicleId": "vehicle-uuid"
}
```

#### DELETE /policies/:id/vehicles/:vehicleId
Remove a vehicle from a policy.

#### PUT /policies/:id/vehicles/:vehicleId
Replace a vehicle on a policy with another vehicle.

**Request Body:**
```json
{
  "newVehicleId": "new-vehicle-uuid"
}
```

---

### 5.7 Utility APIs

#### POST /demo/reset
Reset all data to initial seed state.

**Response 200:**
```json
{
  "success": true,
  "message": "Demo data reset successfully",
  "counts": {
    "drivers": 75,
    "vehicles": 85,
    "policies": 50
  }
}
```

#### GET /health
Health check endpoint.

**Response 200:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-11T10:00:00Z",
  "uptime": 3600
}
```

---

## 6. Seed Data Specification

### 6.1 Data Source Alignment

The seed data MUST align with the bankingcoredemo customer data at:
https://github.com/hrothstein/bankingcoredemo

**Implementation Note:** During build, fetch customer names and addresses from bankingcoredemo to ensure consistency across demo systems.

### 6.2 Seed Data Volumes

| Entity | Count | Notes |
|--------|-------|-------|
| Drivers | 75 | 50 primary (1:1 with customers) + 25 additional family members |
| Vehicles | 85 | Mix of 1-3 vehicles per policy |
| Policies | 50 | One policy per bankingcoredemo customer |

### 6.3 Driver Seed Data Generation

```javascript
// Sample driver generation logic
function generateDriver(customer, isPrimary = true) {
  return {
    id: generateUUID(),
    firstName: customer.firstName,
    lastName: customer.lastName,
    dateOfBirth: generateDateOfBirth(isPrimary ? 25 : 16, isPrimary ? 70 : 25),
    licenseNumber: generateLicenseNumber(customer.state),
    licenseState: customer.state,
    licenseExpiration: generateFutureDate(1, 5), // 1-5 years out
    pointsOnLicense: randomInt(0, 10),
    accidentsCount: randomInt(0, 5),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
```

### 6.4 Vehicle Seed Data

**Make/Model Distribution:**
- Toyota (Camry, Corolla, RAV4, Highlander) - 25%
- Honda (Accord, Civic, CR-V, Pilot) - 20%
- Ford (F-150, Escape, Explorer, Mustang) - 15%
- Chevrolet (Silverado, Equinox, Malibu, Tahoe) - 15%
- BMW (3 Series, 5 Series, X3, X5) - 10%
- Mercedes (C-Class, E-Class, GLC, GLE) - 10%
- Other (Hyundai, Kia, Nissan, etc.) - 5%

**Year Distribution:**
- 2020-2025: 40%
- 2015-2019: 35%
- 2010-2014: 20%
- 2005-2009: 5%

### 6.5 Policy Seed Data

**Premium Ranges:**
- Economy vehicles, clean record: $800-1,200/year
- Standard vehicles, average record: $1,200-1,800/year
- Luxury vehicles or poor record: $1,800-3,000/year
- Multiple vehicles: Base + 75% for each additional

**Policy Value Ranges:**
- Liability only: $25,000-50,000
- Standard coverage: $50,000-100,000
- Full coverage: $100,000-250,000

**Status Distribution:**
- ACTIVE: 85%
- PENDING: 5%
- CANCELLED: 5%
- EXPIRED: 5%

---

## 7. Frontend Specification

### 7.1 Page Structure

```
/                     → Dashboard (policy summary statistics)
/policies             → Policy List View
/policies/new         → Create New Policy Wizard
/policies/:id         → Policy Detail View
/policies/:id/edit    → Edit Policy
/drivers              → Driver List View
/drivers/new          → Create New Driver
/drivers/:id          → Driver Detail View
/drivers/:id/edit     → Edit Driver
/vehicles             → Vehicle List View
/vehicles/new         → Create New Vehicle
/vehicles/:id         → Vehicle Detail View
/vehicles/:id/edit    → Edit Vehicle
```

### 7.2 Dashboard Components

```
┌─────────────────────────────────────────────────────────────────┐
│  🚗 AUTO POLICY SYSTEM                        [Reset Demo Data] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   POLICIES  │  │   DRIVERS   │  │  VEHICLES   │             │
│  │     50      │  │     75      │  │     85      │             │
│  │   Active    │  │   Licensed  │  │  Registered │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  Recent Policies                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ AUTO-00050 │ John Smith │ 2 drivers │ 2 vehicles │ $1,800│   │
│  │ AUTO-00049 │ Jane Doe   │ 1 driver  │ 1 vehicle  │ $1,200│   │
│  │ AUTO-00048 │ Bob Wilson │ 3 drivers │ 2 vehicles │ $2,400│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [View All Policies] [View All Drivers] [View All Vehicles]    │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 Policy List View

```
┌─────────────────────────────────────────────────────────────────┐
│  Policies                                    [+ New Policy]     │
├─────────────────────────────────────────────────────────────────┤
│  Filter: [All Statuses ▼] [Search...                    ] [🔍] │
├─────────────────────────────────────────────────────────────────┤
│  Policy #   │ Policyholder    │ Drivers │ Vehicles │ Premium   │
│  ───────────┼─────────────────┼─────────┼──────────┼───────────│
│  AUTO-00001 │ John Smith      │ 2       │ 1        │ $1,200.00 │
│  AUTO-00002 │ Jane Doe        │ 1       │ 2        │ $1,650.00 │
│  AUTO-00003 │ Robert Johnson  │ 3       │ 2        │ $2,100.00 │
│  ...                                                            │
├─────────────────────────────────────────────────────────────────┤
│  Showing 1-20 of 50                         [< Prev] [Next >]   │
└─────────────────────────────────────────────────────────────────┘
```

### 7.4 Policy Detail View

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Policies              Policy AUTO-00001    [Edit]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Status: ● ACTIVE                                               │
│                                                                 │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │ Policy Details              │  │ Coverage                │  │
│  │ ─────────────────────────── │  │ ─────────────────────── │  │
│  │ Address: 123 Main St        │  │ Premium: $1,200.00/yr   │  │
│  │ City: New York, NY 10001    │  │ Policy Value: $75,000   │  │
│  │ Effective: Jan 1, 2025      │  │                         │  │
│  │ Terminates: Jan 1, 2026     │  │                         │  │
│  └─────────────────────────────┘  └─────────────────────────┘  │
│                                                                 │
│  Drivers (2)                                   [+ Add Driver]   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 👤 John Smith    │ DOB: 03/15/1985 │ Points: 2 │ [Remove] │  │
│  │ 👤 Sarah Smith   │ DOB: 07/22/1988 │ Points: 0 │ [Remove] │  │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Vehicles (1)                                  [+ Add Vehicle]  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🚗 2022 Toyota Camry │ VIN: 1HG...86 │ NY-ABC1234 │[Remove]│ │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.5 Create Policy Wizard

**Step 1: Policy Information**
- Address, City, State, ZIP
- Effective Date, Termination Date
- Premium, Policy Value

**Step 2: Add Drivers**
- Select from existing drivers OR create new
- Add multiple drivers

**Step 3: Add Vehicles**
- Select from existing vehicles OR create new
- Add multiple vehicles

**Step 4: Review & Create**
- Summary of all selections
- Create Policy button

### 7.6 UI Component Library

Use standard HTML/CSS with minimal dependencies:
- React 18 with functional components and hooks
- React Router v6 for navigation
- CSS Modules or Tailwind CSS for styling
- No complex state management (useState/useReducer sufficient)

### 7.7 Styling Guidelines

- Clean, professional appearance suitable for prospect demos
- Responsive design (works on laptop presentations)
- Color scheme: Professional blues and grays
- Clear visual hierarchy
- Consistent spacing and typography

---

## 8. Swagger/OpenAPI Specification

### 8.1 Swagger UI Location
```
http://localhost:3001/docs
```

### 8.2 OpenAPI Configuration

```yaml
openapi: 3.0.3
info:
  title: Auto Policy System API
  description: |
    RESTful API for managing auto insurance policies, drivers, and vehicles.
    This is a demonstration system for MuleSoft integration scenarios.
  version: 1.0.0
  contact:
    name: Salesforce/MuleSoft FSI Team
servers:
  - url: http://localhost:3001/api/v1
    description: Local Development
  - url: https://auto-policy-demo.herokuapp.com/api/v1
    description: Heroku Production
tags:
  - name: Drivers
    description: Driver management operations
  - name: Vehicles
    description: Vehicle management operations
  - name: Policies
    description: Policy management operations
  - name: Policy-Drivers
    description: Manage drivers on policies
  - name: Policy-Vehicles
    description: Manage vehicles on policies
  - name: Utilities
    description: System utilities and demo functions
```

### 8.3 Implementation

Use `swagger-jsdoc` and `swagger-ui-express`:

```javascript
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Auto Policy System API',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
```

---

## 9. Project Structure

```
auto-policy-system/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express app entry point
│   │   ├── datastore.js          # In-memory data store
│   │   ├── seedData.js           # Seed data generation
│   │   ├── routes/
│   │   │   ├── drivers.js        # Driver CRUD routes
│   │   │   ├── vehicles.js       # Vehicle CRUD routes
│   │   │   ├── policies.js       # Policy CRUD routes
│   │   │   └── utilities.js      # Health, reset endpoints
│   │   ├── middleware/
│   │   │   ├── errorHandler.js   # Global error handling
│   │   │   └── validation.js     # Request validation
│   │   └── utils/
│   │       ├── generators.js     # UUID, policy number generators
│   │       └── validators.js     # Data validation helpers
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Main app component
│   │   ├── main.jsx              # React entry point
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── Dashboard/
│   │   │   │   └── Dashboard.jsx
│   │   │   ├── Policies/
│   │   │   │   ├── PolicyList.jsx
│   │   │   │   ├── PolicyDetail.jsx
│   │   │   │   ├── PolicyForm.jsx
│   │   │   │   └── PolicyWizard.jsx
│   │   │   ├── Drivers/
│   │   │   │   ├── DriverList.jsx
│   │   │   │   ├── DriverDetail.jsx
│   │   │   │   └── DriverForm.jsx
│   │   │   ├── Vehicles/
│   │   │   │   ├── VehicleList.jsx
│   │   │   │   ├── VehicleDetail.jsx
│   │   │   │   └── VehicleForm.jsx
│   │   │   └── common/
│   │   │       ├── Card.jsx
│   │   │       ├── Table.jsx
│   │   │       ├── Button.jsx
│   │   │       └── Modal.jsx
│   │   ├── hooks/
│   │   │   └── useApi.js         # API call hook
│   │   ├── services/
│   │   │   └── api.js            # API client
│   │   └── styles/
│   │       └── global.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── Dockerfile
├── Procfile                      # Heroku deployment
├── package.json                  # Root package.json
└── README.md
```

---

## 10. Deployment

### 10.1 Heroku Configuration

**Procfile:**
```
web: npm start
```

**Root package.json scripts:**
```json
{
  "scripts": {
    "start": "node backend/src/index.js",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && node src/index.js",
    "dev:frontend": "cd frontend && npm run dev",
    "build": "cd frontend && npm run build",
    "heroku-postbuild": "npm run build"
  }
}
```

### 10.2 Deployment Steps

```bash
# Login to Heroku
heroku login

# Create app (if new)
heroku create auto-policy-demo

# Deploy
git push heroku main

# View logs
heroku logs --tail

# Open app
heroku open
```

### 10.3 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Server port (Heroku sets this) |
| NODE_ENV | development | Environment mode |

---

## 11. Build Instructions

### 11.1 Prerequisites

- Node.js 20.x LTS
- npm 10.x
- Git
- Heroku CLI (for deployment)

### 11.2 Local Development Setup

```bash
# Clone repository
git clone https://github.com/hrothstein/auto-policy-system.git
cd auto-policy-system

# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..

# Start development servers
npm run dev

# Access:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/api/v1
# Swagger: http://localhost:3001/docs
```

### 11.3 Production Build

```bash
# Build frontend
npm run build

# Start production server
npm start
```

---

## 12. Step-by-Step Implementation Guide

This section provides detailed instructions for a coding agent (e.g., Cursor) to implement the system.

### Phase 1: Project Initialization

**Step 1.1: Create Project Structure**
```bash
mkdir auto-policy-system
cd auto-policy-system
npm init -y
mkdir -p backend/src/{routes,middleware,utils}
mkdir -p frontend/src/{components,hooks,services,styles}
```

**Step 1.2: Install Backend Dependencies**
```bash
cd backend
npm init -y
npm install express cors uuid swagger-jsdoc swagger-ui-express
cd ..
```

**Step 1.3: Install Frontend Dependencies**
```bash
cd frontend
npm create vite@latest . -- --template react
npm install react-router-dom
cd ..
```

**Step 1.4: Configure Root Package.json**
```json
{
  "name": "auto-policy-system",
  "version": "1.0.0",
  "scripts": {
    "start": "node backend/src/index.js",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && node src/index.js",
    "dev:frontend": "cd frontend && npm run dev",
    "build": "cd frontend && npm run build",
    "heroku-postbuild": "npm run build"
  },
  "dependencies": {
    "concurrently": "^8.2.0"
  }
}
```

### Phase 2: Backend Implementation

**Step 2.1: Create In-Memory Datastore (backend/src/datastore.js)**
- Implement Maps for drivers, vehicles, policies
- Create CRUD helper functions
- Implement relationship management

**Step 2.2: Create Seed Data Generator (backend/src/seedData.js)**
- Generate 50 customers aligned with bankingcoredemo
- Generate 75 drivers (50 primary + 25 family members)
- Generate 85 vehicles with realistic make/model distribution
- Generate 50 policies with relationships

**Step 2.3: Implement Driver Routes (backend/src/routes/drivers.js)**
- GET /drivers - List all
- GET /drivers/:id - Get one
- POST /drivers - Create
- PUT /drivers/:id - Update
- DELETE /drivers/:id - Delete (with policy check)

**Step 2.4: Implement Vehicle Routes (backend/src/routes/vehicles.js)**
- Same pattern as drivers

**Step 2.5: Implement Policy Routes (backend/src/routes/policies.js)**
- Full CRUD
- POST /policies/:id/drivers - Add driver
- DELETE /policies/:id/drivers/:driverId - Remove driver
- PUT /policies/:id/drivers/:driverId - Replace driver
- Same pattern for vehicles

**Step 2.6: Implement Utility Routes (backend/src/routes/utilities.js)**
- GET /health
- POST /demo/reset

**Step 2.7: Configure Swagger (backend/src/index.js)**
- Set up swagger-jsdoc
- Add JSDoc comments to all routes
- Mount Swagger UI at /docs

**Step 2.8: Create Express App (backend/src/index.js)**
- Configure CORS
- Mount all routes under /api/v1
- Serve static frontend build in production
- Initialize seed data on startup

### Phase 3: Frontend Implementation

**Step 3.1: Set Up Routing (frontend/src/App.jsx)**
- Configure React Router with all routes
- Create Layout component with header/sidebar

**Step 3.2: Create API Service (frontend/src/services/api.js)**
- Centralized API client with base URL
- Functions for all CRUD operations

**Step 3.3: Create Custom Hook (frontend/src/hooks/useApi.js)**
- Loading state management
- Error handling
- Data fetching

**Step 3.4: Implement Dashboard**
- Statistics cards (policies, drivers, vehicles counts)
- Recent policies list
- Quick action buttons

**Step 3.5: Implement Policy Components**
- PolicyList with filtering and pagination
- PolicyDetail with driver/vehicle management
- PolicyForm for create/edit
- PolicyWizard for step-by-step creation

**Step 3.6: Implement Driver Components**
- DriverList
- DriverDetail
- DriverForm

**Step 3.7: Implement Vehicle Components**
- VehicleList
- VehicleDetail
- VehicleForm

**Step 3.8: Style Application**
- Professional color scheme
- Responsive layout
- Consistent component styling

### Phase 4: Integration & Testing

**Step 4.1: Test All APIs**
- Use Swagger UI to test each endpoint
- Verify CRUD operations
- Test relationship management

**Step 4.2: Test Frontend**
- Navigate all routes
- Create/edit/delete records
- Verify data persistence (in-memory)

**Step 4.3: Test Demo Reset**
- Trigger reset from UI
- Verify all data returns to seed state

### Phase 5: Deployment

**Step 5.1: Create Dockerfile**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

**Step 5.2: Create Procfile**
```
web: npm start
```

**Step 5.3: Deploy to Heroku**
```bash
heroku create auto-policy-demo
git push heroku main
heroku open
```

---

## 13. Testing Checklist

### API Tests
- [ ] GET /drivers returns all drivers
- [ ] GET /drivers/:id returns specific driver
- [ ] POST /drivers creates new driver
- [ ] PUT /drivers/:id updates driver
- [ ] DELETE /drivers/:id deletes driver (not on policy)
- [ ] DELETE /drivers/:id fails for driver on active policy
- [ ] GET /vehicles returns all vehicles
- [ ] GET /vehicles/:id returns specific vehicle
- [ ] POST /vehicles creates new vehicle
- [ ] PUT /vehicles/:id updates vehicle
- [ ] DELETE /vehicles/:id deletes vehicle (not on policy)
- [ ] GET /policies returns all policies
- [ ] GET /policies/:id returns policy with drivers and vehicles
- [ ] POST /policies creates new policy
- [ ] PUT /policies/:id updates policy
- [ ] DELETE /policies/:id deletes policy
- [ ] POST /policies/:id/drivers adds driver to policy
- [ ] DELETE /policies/:id/drivers/:driverId removes driver
- [ ] PUT /policies/:id/drivers/:driverId replaces driver
- [ ] POST /policies/:id/vehicles adds vehicle to policy
- [ ] DELETE /policies/:id/vehicles/:vehicleId removes vehicle
- [ ] PUT /policies/:id/vehicles/:vehicleId replaces vehicle
- [ ] GET /health returns healthy status
- [ ] POST /demo/reset resets all data

### UI Tests
- [ ] Dashboard displays correct statistics
- [ ] Policy list shows all policies
- [ ] Policy list filtering works
- [ ] Policy detail shows drivers and vehicles
- [ ] Can add driver to policy
- [ ] Can remove driver from policy
- [ ] Can add vehicle to policy
- [ ] Can remove vehicle from policy
- [ ] Create policy wizard works end-to-end
- [ ] Driver list displays all drivers
- [ ] Can create new driver
- [ ] Can edit driver
- [ ] Can delete driver (not on policy)
- [ ] Vehicle list displays all vehicles
- [ ] Can create new vehicle
- [ ] Can edit vehicle
- [ ] Can delete vehicle (not on policy)
- [ ] Reset demo data button works

### Swagger Tests
- [ ] Swagger UI loads at /docs
- [ ] All endpoints documented
- [ ] Can execute test requests
- [ ] Response schemas accurate

---

## 14. Future Enhancements (Not in Scope)

The following are explicitly NOT included in v1.0 but could be added later:

- MCP Server integration for AI agents
- Authentication and authorization
- Premium calculation engine
- Claims management
- Payment processing
- Document upload/storage
- Email notifications
- Audit logging
- PostgreSQL persistence option
- Multi-tenant support

---

## 15. Appendix

### A. Sample bankingcoredemo Customer Data

Based on the bankingcoredemo README, customer usernames follow the pattern `john.smith0`. The implementation should:

1. Fetch actual customer data from bankingcoredemo API if available
2. Or generate consistent names using the same pattern:
   - John Smith, Jane Doe, Robert Johnson, etc.
   - Use realistic addresses aligned with customer states

### B. VIN Generation

VINs follow a standard 17-character format:
```
Position 1-3: World Manufacturer Identifier (WMI)
Position 4-8: Vehicle Descriptor Section (VDS)
Position 9: Check digit
Position 10: Model year
Position 11: Plant code
Position 12-17: Sequential number
```

For demo purposes, generate pseudo-valid VINs:
```javascript
function generateVIN() {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  let vin = '';
  for (let i = 0; i < 17; i++) {
    vin += chars[Math.floor(Math.random() * chars.length)];
  }
  return vin;
}
```

### C. License Number Formats by State

Different states have different license number formats. For simplicity, use:
```javascript
function generateLicenseNumber(state) {
  return `${state}${Math.random().toString().slice(2, 10)}`;
}
```

---

**End of PRD**

*This document serves as the complete specification for building the Auto Policy System. A coding agent should be able to implement the entire system using only this document as reference.*
