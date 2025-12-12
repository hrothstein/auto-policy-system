import express from 'express';
import { driverStore } from '../datastore.js';
import { generateUUID } from '../utils/generators.js';
import { validateDriver, validateUUID } from '../middleware/validation.js';
import { policyDriverRelations } from '../datastore.js';

const router = express.Router();

/**
 * @swagger
 * /drivers:
 *   get:
 *     summary: Get all drivers
 *     tags: [Drivers]
 *     responses:
 *       200:
 *         description: List of all drivers
 */
router.get('/', (req, res) => {
  try {
    const drivers = driverStore.getAll();
    res.json({
      success: true,
      data: drivers,
      count: drivers.length
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
 * /drivers/{id}:
 *   get:
 *     summary: Get a specific driver
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Driver details
 *       404:
 *         description: Driver not found
 */
router.get('/:id', validateUUID(), (req, res) => {
  try {
    const driver = driverStore.getById(req.params.id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }
    res.json({
      success: true,
      data: driver
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
 * /drivers:
 *   post:
 *     summary: Create a new driver
 *     tags: [Drivers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - dateOfBirth
 *               - licenseNumber
 *               - licenseState
 *               - licenseExpiration
 *               - pointsOnLicense
 *               - accidentsCount
 *     responses:
 *       201:
 *         description: Driver created successfully
 */
router.post('/', validateDriver, (req, res) => {
  try {
    const driver = {
      id: generateUUID(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const created = driverStore.create(driver);
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
 * /drivers/{id}:
 *   put:
 *     summary: Update a driver
 *     tags: [Drivers]
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
 *         description: Driver updated successfully
 *       404:
 *         description: Driver not found
 */
router.put('/:id', validateUUID(), (req, res) => {
  try {
    const updated = driverStore.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
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
 * /drivers/{id}:
 *   delete:
 *     summary: Delete a driver
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Driver deleted successfully
 *       400:
 *         description: Cannot delete driver associated with active policies
 *       404:
 *         description: Driver not found
 */
router.delete('/:id', validateUUID(), (req, res) => {
  try {
    const driver = driverStore.getById(req.params.id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    // Check for active policies
    const policies = policyDriverRelations.getPoliciesForDriver(req.params.id);
    const activePolicies = policies.filter(p => p.status === 'ACTIVE');
    if (activePolicies.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete driver associated with active policies',
        policyIds: activePolicies.map(p => p.id)
      });
    }

    driverStore.delete(req.params.id);
    res.json({
      success: true,
      message: 'Driver deleted successfully'
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

