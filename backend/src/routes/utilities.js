import express from 'express';
import { generateSeedData } from '../seedData.js';
import { getStatistics } from '../datastore.js';

const router = express.Router();

const startTime = Date.now();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Utilities]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/health', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime
  });
});

/**
 * @swagger
 * /demo/reset:
 *   post:
 *     summary: Reset all data to initial seed state
 *     tags: [Utilities]
 *     responses:
 *       200:
 *         description: Demo data reset successfully
 */
router.post('/demo/reset', async (req, res) => {
  try {
    const counts = await generateSeedData();
    res.json({
      success: true,
      message: 'Demo data reset successfully',
      counts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

