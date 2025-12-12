import express from 'express';
import { policiesStore, policyDriverRelations, policyVehicleRelations } from '../datastore.js';
import { generateUUID, generatePolicyNumber } from '../utils/generators.js';
import { validatePolicy, validateUUID } from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * /policies:
 *   get:
 *     summary: Get all policies
 *     tags: [Policies]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, CANCELLED, EXPIRED, PENDING]
 *       - in: query
 *         name: driverId
 *         schema:
 *           type: string
 *       - in: query
 *         name: vehicleId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all policies
 */
router.get('/', (req, res) => {
  try {
    let policies = policiesStore.getAll();

    // Apply filters
    if (req.query.status) {
      policies = policies.filter(p => p.status === req.query.status);
    }
    if (req.query.driverId) {
      policies = policies.filter(p => {
        const drivers = policyDriverRelations.getDriversForPolicy(p.id);
        return drivers.some(d => d.id === req.query.driverId);
      });
    }
    if (req.query.vehicleId) {
      policies = policies.filter(p => {
        const vehicles = policyVehicleRelations.getVehiclesForPolicy(p.id);
        return vehicles.some(v => v.id === req.query.vehicleId);
      });
    }

    // Populate drivers and vehicles for each policy
    const policiesWithRelations = policies.map(policy => ({
      ...policy,
      drivers: policyDriverRelations.getDriversForPolicy(policy.id),
      vehicles: policyVehicleRelations.getVehiclesForPolicy(policy.id)
    }));

    res.json({
      success: true,
      data: policiesWithRelations,
      count: policiesWithRelations.length
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
 * /policies/{id}:
 *   get:
 *     summary: Get a specific policy
 *     tags: [Policies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Policy details with drivers and vehicles
 *       404:
 *         description: Policy not found
 */
router.get('/:id', validateUUID(), (req, res) => {
  try {
    const policy = policiesStore.getById(req.params.id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }

    const policyWithRelations = {
      ...policy,
      drivers: policyDriverRelations.getDriversForPolicy(policy.id),
      vehicles: policyVehicleRelations.getVehiclesForPolicy(policy.id)
    };

    res.json({
      success: true,
      data: policyWithRelations
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
 * /policies:
 *   post:
 *     summary: Create a new policy
 *     tags: [Policies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - city
 *               - state
 *               - zipCode
 *               - premium
 *               - effectiveDate
 *               - terminationDate
 *               - policyValue
 *               - status
 *     responses:
 *       201:
 *         description: Policy created successfully
 */
router.post('/', validatePolicy, (req, res) => {
  try {
    const policy = {
      id: generateUUID(),
      policyNumber: generatePolicyNumber(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = policiesStore.create(policy);

    // Add drivers if provided
    if (req.body.driverIds && Array.isArray(req.body.driverIds)) {
      req.body.driverIds.forEach(driverId => {
        try {
          policyDriverRelations.addDriverToPolicy(created.id, driverId);
        } catch (error) {
          console.error(`Failed to add driver ${driverId} to policy:`, error.message);
        }
      });
    }

    // Add vehicles if provided
    if (req.body.vehicleIds && Array.isArray(req.body.vehicleIds)) {
      req.body.vehicleIds.forEach(vehicleId => {
        try {
          policyVehicleRelations.addVehicleToPolicy(created.id, vehicleId);
        } catch (error) {
          console.error(`Failed to add vehicle ${vehicleId} to policy:`, error.message);
        }
      });
    }

    const policyWithRelations = {
      ...created,
      drivers: policyDriverRelations.getDriversForPolicy(created.id),
      vehicles: policyVehicleRelations.getVehiclesForPolicy(created.id)
    };

    res.status(201).json({
      success: true,
      data: policyWithRelations
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
 * /policies/{id}:
 *   put:
 *     summary: Update a policy
 *     tags: [Policies]
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
 *         description: Policy updated successfully
 *       404:
 *         description: Policy not found
 */
router.put('/:id', validateUUID(), (req, res) => {
  try {
    const updated = policiesStore.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }

    const policyWithRelations = {
      ...updated,
      drivers: policyDriverRelations.getDriversForPolicy(updated.id),
      vehicles: policyVehicleRelations.getVehiclesForPolicy(updated.id)
    };

    res.json({
      success: true,
      data: policyWithRelations
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
 * /policies/{id}:
 *   delete:
 *     summary: Delete a policy
 *     tags: [Policies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Policy deleted successfully
 *       404:
 *         description: Policy not found
 */
router.delete('/:id', validateUUID(), (req, res) => {
  try {
    const deleted = policiesStore.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }
    res.json({
      success: true,
      message: 'Policy deleted successfully'
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
 * /policies/{id}/drivers:
 *   post:
 *     summary: Add a driver to a policy
 *     tags: [Policy-Drivers]
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
 *             required:
 *               - driverId
 *     responses:
 *       200:
 *         description: Driver added to policy
 */
router.post('/:id/drivers', validateUUID(), (req, res) => {
  try {
    if (!req.body.driverId) {
      return res.status(400).json({
        success: false,
        error: 'driverId is required'
      });
    }

    policyDriverRelations.addDriverToPolicy(req.params.id, req.body.driverId);

    const policy = policiesStore.getById(req.params.id);
    const policyWithRelations = {
      ...policy,
      drivers: policyDriverRelations.getDriversForPolicy(policy.id),
      vehicles: policyVehicleRelations.getVehiclesForPolicy(policy.id)
    };

    res.json({
      success: true,
      data: policyWithRelations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /policies/{id}/drivers/{driverId}:
 *   delete:
 *     summary: Remove a driver from a policy
 *     tags: [Policy-Drivers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Driver removed from policy
 */
router.delete('/:id/drivers/:driverId', validateUUID('id'), validateUUID('driverId'), (req, res) => {
  try {
    policyDriverRelations.removeDriverFromPolicy(req.params.id, req.params.driverId);

    const policy = policiesStore.getById(req.params.id);
    const policyWithRelations = {
      ...policy,
      drivers: policyDriverRelations.getDriversForPolicy(policy.id),
      vehicles: policyVehicleRelations.getVehiclesForPolicy(policy.id)
    };

    res.json({
      success: true,
      data: policyWithRelations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /policies/{id}/drivers/{driverId}:
 *   put:
 *     summary: Replace a driver on a policy
 *     tags: [Policy-Drivers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newDriverId
 *     responses:
 *       200:
 *         description: Driver replaced on policy
 */
router.put('/:id/drivers/:driverId', validateUUID('id'), validateUUID('driverId'), (req, res) => {
  try {
    if (!req.body.newDriverId) {
      return res.status(400).json({
        success: false,
        error: 'newDriverId is required'
      });
    }

    policyDriverRelations.replaceDriverOnPolicy(req.params.id, req.params.driverId, req.body.newDriverId);

    const policy = policiesStore.getById(req.params.id);
    const policyWithRelations = {
      ...policy,
      drivers: policyDriverRelations.getDriversForPolicy(policy.id),
      vehicles: policyVehicleRelations.getVehiclesForPolicy(policy.id)
    };

    res.json({
      success: true,
      data: policyWithRelations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /policies/{id}/vehicles:
 *   post:
 *     summary: Add a vehicle to a policy
 *     tags: [Policy-Vehicles]
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
 *             required:
 *               - vehicleId
 *     responses:
 *       200:
 *         description: Vehicle added to policy
 */
router.post('/:id/vehicles', validateUUID(), (req, res) => {
  try {
    if (!req.body.vehicleId) {
      return res.status(400).json({
        success: false,
        error: 'vehicleId is required'
      });
    }

    policyVehicleRelations.addVehicleToPolicy(req.params.id, req.body.vehicleId);

    const policy = policiesStore.getById(req.params.id);
    const policyWithRelations = {
      ...policy,
      drivers: policyDriverRelations.getDriversForPolicy(policy.id),
      vehicles: policyVehicleRelations.getVehiclesForPolicy(policy.id)
    };

    res.json({
      success: true,
      data: policyWithRelations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /policies/{id}/vehicles/{vehicleId}:
 *   delete:
 *     summary: Remove a vehicle from a policy
 *     tags: [Policy-Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vehicle removed from policy
 */
router.delete('/:id/vehicles/:vehicleId', validateUUID('id'), validateUUID('vehicleId'), (req, res) => {
  try {
    policyVehicleRelations.removeVehicleFromPolicy(req.params.id, req.params.vehicleId);

    const policy = policiesStore.getById(req.params.id);
    const policyWithRelations = {
      ...policy,
      drivers: policyDriverRelations.getDriversForPolicy(policy.id),
      vehicles: policyVehicleRelations.getVehiclesForPolicy(policy.id)
    };

    res.json({
      success: true,
      data: policyWithRelations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /policies/{id}/vehicles/{vehicleId}:
 *   put:
 *     summary: Replace a vehicle on a policy
 *     tags: [Policy-Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newVehicleId
 *     responses:
 *       200:
 *         description: Vehicle replaced on policy
 */
router.put('/:id/vehicles/:vehicleId', validateUUID('id'), validateUUID('vehicleId'), (req, res) => {
  try {
    if (!req.body.newVehicleId) {
      return res.status(400).json({
        success: false,
        error: 'newVehicleId is required'
      });
    }

    policyVehicleRelations.replaceVehicleOnPolicy(req.params.id, req.params.vehicleId, req.body.newVehicleId);

    const policy = policiesStore.getById(req.params.id);
    const policyWithRelations = {
      ...policy,
      drivers: policyDriverRelations.getDriversForPolicy(policy.id),
      vehicles: policyVehicleRelations.getVehiclesForPolicy(policy.id)
    };

    res.json({
      success: true,
      data: policyWithRelations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

