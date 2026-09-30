import { StatusCodes } from 'http-status-codes';

// Base error class that all custom errors extend from.
// This makes it easy to identify "expected" errors vs unexpected ones.
export class CustomAPIError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

export class BadRequestError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

export class UnauthorizedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

export class ForbiddenError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

// http-status-codes@2.x has no 413 constant, so the RFC 9110 value is used
// directly. Without this an oversized upload would fall through to a 500.
const PAYLOAD_TOO_LARGE = 413;

export class PayloadTooLargeError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = PAYLOAD_TOO_LARGE;
  }
}
