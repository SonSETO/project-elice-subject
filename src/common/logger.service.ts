import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class CustomLoggerService implements LoggerService {
  log(message: any, ...optionalParams: any[]) {
    const serializedParams = optionalParams.map((param) =>
      typeof param === 'object' ? JSON.stringify(param, null, 2) : param,
    );
    console.log(`[LOG]: ${message}`, ...serializedParams);
  }

  error(message: any, ...optionalParams: any[]) {
    console.error(`[ERROR]: ${message}`, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    console.warn(`[WARN]: ${message}`, ...optionalParams);
  }

  debug?(message: any, ...optionalParams: any[]) {
    console.debug(`[DEBUG]: ${message}`, ...optionalParams);
  }

  verbose?(message: any, ...optionalParams: any[]) {
    const serializedParams = optionalParams.map((param) =>
      typeof param === 'object' ? JSON.stringify(param, null, 2) : param,
    );
    console.info(`[VERBOSE]: ${message}`, ...serializedParams);
  }
}
