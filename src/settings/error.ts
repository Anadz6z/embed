export interface ErrorOptions {
  code?: string;
  cause?: unknown;
  details?: any;
  statusCode?: number;
  isOperational?: boolean;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly cause?: unknown;
  public readonly details?: any;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;

  constructor(message: string, options: ErrorOptions = {}) {
    super(message);
    
    this.name = this.constructor.name;
    this.code = options.code || "UNKNOWN_ERROR";
    this.cause = options.cause;
    this.details = options.details;
    this.statusCode = options.statusCode || 500;
    this.isOperational = options.isOperational ?? true;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack
    };
  }

  toString() {
    return `${this.name}: ${this.message} (${this.code})`;
  }
}

export function createError(message: string, options?: ErrorOptions): AppError {
  return new AppError(message, options);
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function handleError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, {
      code: "WRAPPED_ERROR",
      cause: error
    });
  }

  return new AppError("An unknown error occurred", {
    code: "UNKNOWN_ERROR",
    cause: error
  });
}

export function logError(error: unknown, context?: string): void {
  const appError = handleError(error);
  
  const logData = {
    context: context || "Unknown",
    error: appError.toJSON()
  };

  if (appError.isOperational) {
    console.warn("Operational error:", logData);
  } else {
    console.error("System error:", logData);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, {
      code: "VALIDATION_ERROR",
      statusCode: 400,
      details
    });
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
      
    super(message, {
      code: "NOT_FOUND",
      statusCode: 404,
      details: { resource, identifier }
    });
  }
}

export class PermissionError extends AppError {
  constructor(action: string, resource?: string) {
    const message = resource
      ? `Permission denied for action '${action}' on resource '${resource}'`
      : `Permission denied for action '${action}'`;
      
    super(message, {
      code: "PERMISSION_DENIED",
      statusCode: 403,
      details: { action, resource }
    });
  }
}