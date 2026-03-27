import pino from 'pino';

import { env } from '@/config/env';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: env.LOG_LEVEL,
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss.l',
        ignore: 'pid,hostname',
      },
    },
  }),
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: isDevelopment
      ? []
      : [
          'password',
          'secret',
          'token',
          'accessToken',
          'refreshToken',
          'authorization',
          'cookie',
          'otp',
          'headers.authorization',
          'headers.cookie',
        ],
  },
});

/**
 * Create a child logger scoped to a specific module or domain.
 *
 * @example
 * ```ts
 * const log = createLogger('auth');
 * log.info({ email }, 'User signed in');
 * ```
 */
export function createLogger(module: string) {
  return logger.child({ module });
}

export type Logger = pino.Logger;
