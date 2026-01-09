/**
 * Simple logger utility
 * Provides consistent logging interface across the application
 */

type LogLevel = 'log' | 'warn' | 'error'

class Logger {
  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    return `${prefix} ${message}`
  }

  log(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.formatMessage('log', message), ...args)
    }
  }

  warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage('warn', message), ...args)
  }

  error(message: string, ...args: any[]): void {
    console.error(this.formatMessage('error', message), ...args)
  }
}

export const logger = new Logger()
