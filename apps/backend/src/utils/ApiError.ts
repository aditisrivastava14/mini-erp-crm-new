export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: any;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    errors?: any,
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
