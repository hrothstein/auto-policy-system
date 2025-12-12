import express from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateSeedData } from './seedData.js';
import { errorHandler } from './middleware/errorHandler.js';
import driversRouter from './routes/drivers.js';
import vehiclesRouter from './routes/vehicles.js';
import policiesRouter from './routes/policies.js';
import utilitiesRouter from './routes/utilities.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Auto Policy System API',
      version: '1.0.0',
      description: 'RESTful API for managing auto insurance policies, drivers, and vehicles. This is a demonstration system for MuleSoft integration scenarios.',
      contact: {
        name: 'Salesforce/MuleSoft FSI Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Local Development'
      },
      {
        url: 'https://auto-policy-demo.herokuapp.com/api/v1',
        description: 'Heroku Production'
      }
    ],
    tags: [
      {
        name: 'Drivers',
        description: 'Driver management operations'
      },
      {
        name: 'Vehicles',
        description: 'Vehicle management operations'
      },
      {
        name: 'Policies',
        description: 'Policy management operations'
      },
      {
        name: 'Policy-Drivers',
        description: 'Manage drivers on policies'
      },
      {
        name: 'Policy-Vehicles',
        description: 'Manage vehicles on policies'
      },
      {
        name: 'Utilities',
        description: 'System utilities and demo functions'
      }
    ]
  },
  apis: [
    join(__dirname, 'routes/*.js'),
    join(__dirname, 'routes/drivers.js'),
    join(__dirname, 'routes/vehicles.js'),
    join(__dirname, 'routes/policies.js'),
    join(__dirname, 'routes/utilities.js')
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Debug: Log Swagger spec paths
console.log('Swagger API paths:', Object.keys(swaggerSpec.paths || {}).length, 'paths found');
if (Object.keys(swaggerSpec.paths || {}).length === 0) {
  console.warn('Warning: No Swagger paths found. Check that route files have @swagger annotations.');
}

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Auto Policy System API Documentation'
}));

// Expose Swagger JSON spec
app.get('/docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Routes
app.use('/api/v1/drivers', driversRouter);
app.use('/api/v1/vehicles', vehiclesRouter);
app.use('/api/v1/policies', policiesRouter);
app.use('/api/v1', utilitiesRouter);

// Serve static frontend build in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));
  
  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(join(frontendPath, 'index.html'));
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize seed data on startup
async function initialize() {
  try {
    console.log('Generating seed data...');
    const counts = await generateSeedData();
    console.log(`Seed data generated: ${counts.drivers} drivers, ${counts.vehicles} vehicles, ${counts.policies} policies`);
  } catch (error) {
    console.error('Error generating seed data:', error);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/v1`);
  console.log(`Swagger: http://localhost:${PORT}/docs`);
  
  await initialize();
});

export default app;

