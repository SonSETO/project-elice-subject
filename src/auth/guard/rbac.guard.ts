// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { Observable } from 'rxjs';
// import { UserRole } from 'src/common/utils/enum/user-enum';

// @Injectable()
// export class RBACGuard implements CanActivate{
//     constructor(
//         private readonly reflector: Reflector
//     ){}

//     canActivate(context: ExecutionContext): boolean  {
//         const role = this.reflector.get<UserRole>(RBAC, context.getHandler())
//     }
// }
