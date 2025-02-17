import chalk from 'chalk';
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(label({ label: 'HOPLA!' }), timestamp(), myFormat),
  transports: [new transports.Console()],
});

export interface ILogger {
  success(message: string): void;
  info(message: string): void;
  warning(message: string): void;
  error(message: string): void;
}

export class Logger implements ILogger {
  success(message: string): void {
    logger.log({
      level: 'info',
      message: chalk.green(`✔ ${message}`),
    });
  }

  info(message: string): void {
    logger.log({
      level: 'info',
      message: chalk.blue(`ℹ ${message}`),
    });
  }

  warning(message: string): void {
    logger.log({
      level: 'warn',
      message: chalk.yellow(`⚠ ${message}`),
    });
  }

  error(message: string): void {
    logger.log({
      level: 'error',
      message: chalk.red(`✖ ${message}`),
    });
  }
}
