/**
 * Logger Utility
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

class Logger {
  private level: LogLevel;

  constructor() {
    this.level = LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG, LogLevel.VERBOSE];
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}] ` : '';
    return `${timestamp} [${level.toUpperCase()}] ${contextStr}${message}`;
  }

  error(message: string, context?: string, error?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formatted = this.formatMessage(LogLevel.ERROR, message, context);
      console.error(formatted);
      if (error) {
        console.error(error);
      }
    }
  }

  warn(message: string, context?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formatted = this.formatMessage(LogLevel.WARN, message, context);
      console.warn(formatted);
    }
  }

  info(message: string, context?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formatted = this.formatMessage(LogLevel.INFO, message, context);
      console.log(formatted);
    }
  }

  debug(message: string, context?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formatted = this.formatMessage(LogLevel.DEBUG, message, context);
      console.debug(formatted);
    }
  }

  verbose(message: string, context?: string): void {
    if (this.shouldLog(LogLevel.VERBOSE)) {
      const formatted = this.formatMessage(LogLevel.VERBOSE, message, context);
      console.log(formatted);
    }
  }
}

export const logger = new Logger();
