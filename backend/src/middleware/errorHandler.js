/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Handle validation errors
  if (err.message && err.message.includes('Missing required fields')) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  // Handle not found errors
  if (err.message && err.message.includes('not found')) {
    return res.status(404).json({
      success: false,
      error: err.message
    });
  }

  // Handle business rule violations
  if (err.message && err.message.includes('Cannot delete')) {
    return res.status(400).json({
      success: false,
      error: err.message,
      ...(err.policyIds && { policyIds: err.policyIds })
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
}

