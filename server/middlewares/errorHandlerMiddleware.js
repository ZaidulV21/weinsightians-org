import { StatusCodes } from 'http-status-codes';
import { isProduction } from '../utils/envUtils.js';
import { CustomAPIError } from '../errors/customErrors.js';

// ==========================================
// CENTRAL ERROR HANDLER
// ==========================================
// Two rules:
//   1. The client only ever sees a message this file chose, or a message that a
//      controller deliberately attached to a CustomAPIError. Never a stack
//      trace, a MongoDB driver message, a filesystem path, or a JWT/Cloudinary
//      secret.
//   2. The details stay in the server log, where they are useful.
//
// A 5xx additionally logs the full error. A 4xx does not: bad input is normal
// traffic and logging every one of them is how logs turn into noise.

const GENERIC_MESSAGE = 'Something went wrong. Please try again later.';

// Driver-level errors are mapped to a safe client message so a unique-index
// clash or a bad ObjectId can never leak a collection name or a query.
const mapDatabaseError = (error) => {
  if (error?.name === 'ValidationError' && error.errors) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      message: Object.values(error.errors)
        .map((field) => field.message)
        .join(', '),
    };
  }

  if (error?.name === 'CastError') {
    return { statusCode: StatusCodes.BAD_REQUEST, message: 'Malformed request.' };
  }

  if (error?.code === 11000) {
    return { statusCode: StatusCodes.CONFLICT, message: 'That value is already in use.' };
  }

  if (error?.name === 'MongoNetworkError' || error?.name === 'MongooseServerSelectionError') {
    return { statusCode: StatusCodes.SERVICE_UNAVAILABLE, message: 'Service temporarily unavailable.' };
  }

  return null;
};

const errorHandlerMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err?.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err instanceof CustomAPIError ? err.message : null;

  if (!message) {
    const mapped = mapDatabaseError(err);
    if (mapped) {
      statusCode = mapped.statusCode;
      message = mapped.message;
    }
  }

  if (!message) {
    // Unexpected failure: log everything, tell the client nothing.
    console.error('❌ Unhandled error:', err);
    message = GENERIC_MESSAGE;
  } else if (statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) {
    console.error('❌ Server error:', err);
  } else if (!isProduction()) {
    console.warn(`⚠️  ${req.method} ${req.originalUrl} → ${statusCode}: ${message}`);
  }

  return res.status(statusCode).json({
    success: false,
    msg: message,
    // Same string under both keys: older admin screens read `msg`, newer ones
    // read `message`, and the two must never disagree.
    message,
  });
};

export default errorHandlerMiddleware;
