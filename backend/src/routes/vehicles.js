import express from 'express';
import { vehicleStore } from '../datastore.js';
import { generateUUID } from '../utils/generators.js';
import { validateVehicle, validateUUID } from '../middleware/validation.js';
import { policyVehicleRelations } from '../datastore.js';

const router = express.Router();

/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: Get all vehicles
 *     tags: [Vehicles]
 *     responses:
 *       200:
 *         description: List of all vehicles
 */
router.get('/', (req, res) => {
  try {
    const vehicles = vehicleStore.getAll();
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     summary: Get a specific vehicle
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vehicle details
 *       404:
 *         description: Vehicle not found
 */
router.get('/:id', validateUUID(), (req, res) => {
  try {
    const vehicle = vehicleStore.getById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }
    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /vehicles:
 *   post:
 *     summary: Create a new vehicle
 *     tags: [Vehicles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year
 *               - make
 *               - model
 *               - vin
 *               - plate
 *               - plateState
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 */
router.post('/', validateVehicle, (req, res) => {
  try {
    const vehicle = {
      id: generateUUID(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const created = vehicleStore.create(vehicle);
    res.status(201).json({
      success: true,
      data: created
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /vehicles/{id}:
 *   put:
 *     summary: Update a vehicle
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 *       404:
 *         description: Vehicle not found
 */
router.put('/:id', validateUUID(), (req, res) => {
  try {
    const updated = vehicleStore.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }
    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /vehicles/{id}:
 *   delete:
 *     summary: Delete a vehicle
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully
 *       400:
 *         description: Cannot delete vehicle associated with active policies
 *       404:
 *         description: Vehicle not found
 */
router.delete('/:id', validateUUID(), (req, res) => {
  try {
    const vehicle = vehicleStore.getById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // Check for active policies
    const policies = policyVehicleRelations.getPoliciesForVehicle(req.params.id);
    const activePolicies = policies.filter(p => p.status === 'ACTIVE');
    if (activePolicies.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete vehicle associated with active policies',
        policyIds: activePolicies.map(p => p.id)
      });
    }

    vehicleStore.delete(req.params.id);
    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    if (error.message.includes('Cannot delete')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

