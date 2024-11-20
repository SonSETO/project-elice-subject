import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { v4 as uuidv4 } from 'uuid';
import { CustomLoggerService } from '../logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, path } = req;
    const requestId = uuidv4();
    const now = Date.now();

    this.logger.log(
      `\n[Request Start] [${requestId}] ${method} ${path}\n------------------------------------------------------------`,
    );

    return next.handle().pipe(
      tap((data) => {
        this.logger.log(
          `[Request End] [${requestId}] ${method} ${path} - ${Date.now() - now}ms`,
        );
        this.logger.verbose(
          `\n[Response] [${requestId}]\n------------------------------------------------------------\n${JSON.stringify(
            data,
            null,
            2,
          )}\n------------------------------------------------------------`,
        );
      }),
    );
  }
}
