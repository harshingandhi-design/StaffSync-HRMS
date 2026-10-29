export function notFound(req, res, next) {
  res.status(404).json({ message: `StaffSync Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  console.error('[StaffSync Server Error]', err);

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'record';
    return res.status(409).json({ message: `A ${field} with this value already exists in the system.` });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Resource not found with specified identifier.` });
  }

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
  });
}
