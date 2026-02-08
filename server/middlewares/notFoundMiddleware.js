import { StatusCodes } from 'http-status-codes';

// Catches any route that wasn't matched by our routers.
const notFoundMiddleware = (req, res) => {
    res.status(StatusCodes.NOT_FOUND).json({ msg: 'Route does not exist' });
};

export default notFoundMiddleware;
