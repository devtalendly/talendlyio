import type {
  PhraseForCode,
  StatusCode,
  StatusCodeName,
  StatusForCode,
} from './status-codes';
import { StatusCodes, getReasonPhrase } from './status-codes';

/** The default message literal for a given error code */
type DefaultMessage<C extends StatusCodeName> = PhraseForCode<C>;

/** The HTTP status literal for a given error code */
type ErrorStatus<C extends StatusCodeName> = StatusForCode<C>;

/** The HTTP reason phrase literal for a given error code (derived from its status) */
type ErrorPhrase<C extends StatusCodeName> = PhraseForCode<C>;

export type { DefaultMessage, ErrorPhrase, ErrorStatus };

export interface SerializedException {
  name: string;
  message: string;
  code: StatusCodeName;
  statusCode: StatusCode;
  isOperational: boolean;
  context?: Record<string, unknown>;
  cause?: SerializedException | { message: string };
  stack?: string;
}

interface AppExceptionOptions<C extends StatusCodeName> {
  /** Override the default message for this error code */
  message?: string | undefined;
  isOperational?: boolean | undefined;
  context?: Record<string, unknown> | undefined;
  cause?: Error | undefined;

  // Private — resolved internally from the registry.
  // Exposed only so subclasses can call super() cleanly.
  _statusOverride?: ErrorStatus<C> | undefined;
}

export class AppException<
  Code extends StatusCodeName = StatusCodeName,
> extends Error {
  /** Machine-readable error code (e.g. 'ENTITY_NOT_FOUND') */
  readonly code: Code;

  /** HTTP status code hint for upstream handlers */
  readonly statusCode: ErrorStatus<Code>;

  /**
   * Operational errors are expected runtime failures (bad input, 404s).
   * Non-operational errors are programmer mistakes / unknown crashes —
   * these should trigger alerts, not user-facing messages.
   */
  readonly isOperational: boolean;

  /** Arbitrary structured data attached to the error */
  readonly context: Record<string, unknown>;

  /** Timestamp of error creation (ISO-8601) */
  public readonly timestamp: string;

  constructor(code: Code, options: AppExceptionOptions<Code> = {}) {
    const msg =
      options.message ??
      getReasonPhrase(options._statusOverride ?? StatusCodes[code]);
    const statusCode =
      options._statusOverride ?? (StatusCodes[code] as ErrorStatus<Code>);

    super(msg, { cause: options.cause });

    // Restore prototype chain broken by extending built-ins
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = new.target.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational =
      code === 'INTERNAL_SERVER_ERROR'
        ? false
        : (options.isOperational ?? true);
    this.context = options.context ?? {};
    this.timestamp = new Date().toISOString();

    // Capture stack from the call site, not this constructor
    Error.captureStackTrace?.(this, new.target);
  }

  /** Flat, JSON-safe representation for logging / API responses */
  toJSON(includeStack = false): SerializedException {
    const json: SerializedException = {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
    };

    if (Object.keys(this.context).length > 0) {
      json.context = this.context;
    }

    if (this.cause instanceof AppException) {
      json.cause = this.cause.toJSON(includeStack);
    } else if (this.cause instanceof Error) {
      json.cause = { message: this.cause.message };
    }

    if (includeStack && this.stack) {
      json.stack = this.stack;
    }

    return json;
  }

  /** Type guard usable anywhere: `if (AppError.is(err)) { ... }` */
  static is(value: unknown): value is AppException {
    return value instanceof AppException;
  }
}

type InheritedExceptionOptions<Code extends StatusCodeName> = Omit<
  AppExceptionOptions<Code>,
  '_statusOverride' | 'message'
>;

export class NotFoundException extends AppException<'NOT_FOUND'> {
  constructor(
    message: string,
    options: InheritedExceptionOptions<'NOT_FOUND'> = {},
  ) {
    super('NOT_FOUND', {
      ...options,
      message,
    });
  }
}

export class BadRequestException extends AppException<'BAD_REQUEST'> {
  constructor(
    message: string,
    options: InheritedExceptionOptions<'BAD_REQUEST'> = {},
  ) {
    super('BAD_REQUEST', {
      ...options,
      message,
    });
  }
}

export class UnauthorizedException extends AppException<'UNAUTHORIZED'> {
  constructor(
    message: string,
    options: InheritedExceptionOptions<'UNAUTHORIZED'> = {},
  ) {
    super('UNAUTHORIZED', {
      ...options,
      message,
    });
  }
}

export class ForbiddenException extends AppException<'FORBIDDEN'> {
  constructor(
    message: string,
    options: InheritedExceptionOptions<'FORBIDDEN'> = {},
  ) {
    super('FORBIDDEN', {
      ...options,
      message,
    });
  }
}

export class ConflictException extends AppException<'CONFLICT'> {
  constructor(
    message: string,
    options: InheritedExceptionOptions<'CONFLICT'> = {},
  ) {
    super('CONFLICT', {
      ...options,
      message,
    });
  }
}

export class TooManyRequestsException extends AppException<'TOO_MANY_REQUESTS'> {
  constructor(
    message: string,
    options: InheritedExceptionOptions<'TOO_MANY_REQUESTS'> = {},
  ) {
    super('TOO_MANY_REQUESTS', {
      ...options,
      message,
    });
  }
}

export class InternalServerErrorException extends AppException<'INTERNAL_SERVER_ERROR'> {
  constructor(
    message: string,
    options: InheritedExceptionOptions<'INTERNAL_SERVER_ERROR'> = {},
  ) {
    super('INTERNAL_SERVER_ERROR', {
      ...options,
      message,
      isOperational: false,
    });
  }
}

export function createException<Code extends StatusCodeName>(
  code: Code,
  message?: string,
  options: Omit<AppExceptionOptions<Code>, 'message'> = {},
): AppException<Code> {
  return new AppException(code, { ...options, message });
}

/**
 * Normalise any thrown value into an AppError.
 * Unknown / non-Error throws become non-operational internal errors.
 */
export function normalizeError(thrown: unknown): AppException {
  if (AppException.is(thrown)) return thrown;

  if (thrown instanceof Error) {
    return new AppException('INTERNAL_SERVER_ERROR', {
      message: thrown.message,
      isOperational: false,
      cause: thrown,
    }) as AppException;
  }

  return new AppException('INTERNAL_SERVER_ERROR', {
    message: String(thrown),
    isOperational: false,
  }) as AppException;
}
