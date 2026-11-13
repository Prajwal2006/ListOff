export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "WRONG_PHASE"
  | "DEADLINE_PASSED"
  | "RATE_LIMITED"
  | "LIMIT_REACHED";

const STATUS: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  WRONG_PHASE: 409,
  DEADLINE_PASSED: 409,
  RATE_LIMITED: 429,
  LIMIT_REACHED: 422,
};

export class GameError extends Error {
  readonly status: number;
  constructor(
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.status = STATUS[code];
  }
}

export const fail = (code: ErrorCode, message: string): never => {
  throw new GameError(code, message);
};
