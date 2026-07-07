const AppError = require('../utils/appError');

const handleCastErrorDB = (err) =>
    new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateFieldsDB = (err) => {
    const value = Object.values(err.keyValue || {})[0];
    return new AppError(`Duplicate field value: ${value}. Please use another value.`, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors || {}).map((el) => el.message);
    return new AppError(`Invalid input data: ${errors.join('. ')}`, 400);
};

const handleJWTError = () =>
    new AppError('Invalid token. Please login again.', 401);

const handleJWTExpiredError = () =>
    new AppError('Token expired. Please login again.', 401);

module.exports = (err, req, res, next) => {
    let error = err;

    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    return res.status(error.statusCode || 500).json({
        success: false,
        status: error.status || 'error',
        message: error.isOperational
            ? error.message
            : 'Something went wrong.',
    });
};