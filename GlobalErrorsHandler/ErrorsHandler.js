const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppErrors');
 
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  console.log(message);
  return new AppError(message, 400);
};
 
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
 
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
 
const handleJWTError = () => {
  return new AppError('Invalid token, please log in again!', 401);
};
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please login again', 401);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
 
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
 
    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);
 
    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};
 
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } 
  else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }; 
    if (err instanceof mongoose.Error.CastError) {
      error = handleCastErrorDB(error);
      console.log(error);
    }
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err instanceof mongoose.Error.ValidationError) {
      error = handleValidationErrorDB(error);
      console.log(error);
    }
    if (err instanceof jwt.JsonWebTokenError) error = handleJWTError(error);
    if (err instanceof jwt.TokenExpiredError)
      error = handleJWTExpiredError(error);
    sendErrorProd(error, res);
  }
};