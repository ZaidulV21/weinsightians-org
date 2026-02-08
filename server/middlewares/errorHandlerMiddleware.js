import { StatusCodes } from 'http-status-codes';

// Central error handler — catches all errors thrown in the app.
// Custom errors have statusCode attached, otherwise we default to 500.
const errorHandlerMiddleware = (err, req, res, next) => {
    console.error(err);

    const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const msg = err.message || 'Something went wrong, please try again later';

    res.status(statusCode).json({ msg });
};

export default errorHandlerMiddleware;
