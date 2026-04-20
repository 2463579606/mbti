/**
 * Error Codes and Error Handling
 */

export enum ErrorCode {
  // Success
  SUCCESS = 200,

  // HTTP Errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,

  // Business Errors (10xxx)
  INVALID_PARAMS = 10001,
  SESSION_NOT_FOUND = 10002,
  SESSION_EXPIRED = 10003,
  QUESTION_NOT_FOUND = 10004,
  DUPLICATE_ANSWER = 10005,
  TEST_COMPLETED = 10006,
  TEST_INCOMPLETE = 10007,

  // Scoring Errors (20xxx)
  INSUFFICIENT_ANSWERS = 20001,
  REPORT_NOT_FOUND = 20002,
  INVALID_QUESTION_DATA = 20003,

  // User Errors (30xxx)
  USER_NOT_FOUND = 30001,
  USER_BANNED = 30002,
  PERMISSION_DENIED = 30003,

  // System Errors (50xxx)
  DATABASE_ERROR = 50001,
  CACHE_ERROR = 50002,
  EXTERNAL_SERVICE_ERROR = 50003,
}

export class AppError extends Error {
  public readonly code: number;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: number,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined errors
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', code: number = ErrorCode.BAD_REQUEST) {
    super(message, code, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, ErrorCode.UNAUTHORIZED, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, ErrorCode.FORBIDDEN, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found', code: number = ErrorCode.NOT_FOUND) {
    super(message, code, 404);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too Many Requests') {
    super(message, ErrorCode.TOO_MANY_REQUESTS, 429);
  }
}

// Business-specific errors
export class SessionNotFoundError extends AppError {
  constructor() {
    super('Session not found or expired', ErrorCode.SESSION_NOT_FOUND, 404);
  }
}

export class DuplicateAnswerError extends AppError {
  constructor() {
    super('Question already answered', ErrorCode.DUPLICATE_ANSWER, 400);
  }
}

export class TestCompletedError extends AppError {
  constructor() {
    super('Test already completed', ErrorCode.TEST_COMPLETED, 400);
  }
}

export class TestIncompleteError extends AppError {
  constructor(missing: number[]) {
    super(
      `Test incomplete. Missing ${missing.length} questions.`,
      ErrorCode.TEST_INCOMPLETE,
      400
    );
  }
}

export class InsufficientAnswersError extends AppError {
  constructor(required: number, provided: number) {
    super(
      `Insufficient answers. Required: ${required}, Provided: ${provided}`,
      ErrorCode.INSUFFICIENT_ANSWERS,
      400
    );
  }
}
