import { StatusCodes } from 'http-status-codes';

// Catches any route that wasn't matched by our routers.
// The requested path is echoed back, so this stays free of internal detail.
const notFoundMiddleware = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    msg: 'Route does not exist',
    message: 'Route does not exist',
  });
};

export default notFoundMiddleware;
