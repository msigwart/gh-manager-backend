// Authentication errors
export const MISSING_SESSION_ID_ERROR = 100
export const MISSING_LOGIN_CODE_ERROR = 101
export const INVALID_SESSION_ERROR = 102

// Application errors
export const USER_NOT_FOUND_ERROR = 200
export const UNKNOWN_ERROR = 201
export const RESOURCE_NOT_FOUND_ERROR = 202

abstract class AbstractError extends Error {
  protected constructor(
    public statusCode: number,
    public errorId: number,
    public errorMsg: string
  ) {
    super(errorMsg)
  }
}

export class ValidationError extends AbstractError {
  constructor(errorId: number, errorMsg: string) {
    super(400, errorId, errorMsg)
  }
}

export class AuthenticationError extends AbstractError {
  constructor(errorId: number, errorMsg: string) {
    super(401, errorId, errorMsg)
  }
}

export class ForbiddenError extends AbstractError {
  constructor(errorId: number, errorMsg: string) {
    super(403, errorId, errorMsg)
  }
}

export class NotFoundError extends AbstractError {
  constructor(errorId: number, errorMsg: string) {
    super(404, errorId, errorMsg)
  }
}

export class ServerError extends AbstractError {
  constructor(errorId: number, errorMsg: string) {
    super(500, errorId, errorMsg)
  }
}
