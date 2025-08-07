export interface ErrorDetails {
  code: string;
  message: string;
  details?: any;
  cause?: Error;
  timestamp: Date;
  context?: string;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly details?: any;
  public readonly timestamp: Date;
  public readonly context?: string;

  constructor(message: string, options: Omit<ErrorDetails, 'message' | 'timestamp'>) {
    super(message);
    this.name = 'AppError';
    this.code = options.code;
    this.details = options.details;
    this.cause = options.cause;
    this.timestamp = new Date();
    this.context = options.context;
  }

  static isAppError(error: any): error is AppError {
    return error instanceof AppError;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, {
      code: 'VALIDATION_ERROR',
      details
    });
    this.name = 'ValidationError';
  }
}

export class PermissionError extends AppError {
  constructor(message: string, details?: any) {
    super(message, {
      code: 'PERMISSION_ERROR',
      details
    });
    this.name = 'PermissionError';
  }
}

export class DiscordAPIError extends AppError {
  constructor(message: string, details?: any) {
    super(message, {
      code: 'DISCORD_API_ERROR',
      details
    });
    this.name = 'DiscordAPIError';
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, {
      code: 'CONFIGURATION_ERROR',
      details
    });
    this.name = 'ConfigurationError';
  }
}

export function createError(message: string, options: Omit<ErrorDetails, 'message' | 'timestamp'>): AppError {
  return new AppError(message, options);
}

export function handleError(error: unknown, context?: string): AppError {
  if (AppError.isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, {
      code: 'UNKNOWN_ERROR',
      cause: error,
      context
    });
  }

  return new AppError('An unknown error occurred', {
    code: 'UNKNOWN_ERROR',
    details: error,
    context
  });
}