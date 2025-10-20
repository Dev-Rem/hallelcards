import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../roles.decorator';

// Injectable decorator makes this class available for dependency injection
@Injectable()
// RolesGuard implements CanActivate interface to create a custom authorization guard
export class RolesGuard implements CanActivate {
  // Inject Reflector service to read metadata from route handlers and controllers
  constructor(private readonly reflector: Reflector) {}

  // canActivate method determines if the current user can access the protected route
  canActivate(context: ExecutionContext): boolean {
    // Get required roles from the @Roles decorator metadata
    // Check both the route handler method and the controller class for role requirements
    const requiredRoles = this.reflector.getAllAndOverride<
      string[] | undefined
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);

    // If no roles are required, allow access (public route)
    if (!requiredRoles || requiredRoles.length === 0) return true;

    // Extract the HTTP request object from the execution context
    const request = context.switchToHttp().getRequest();

    // Get the user object from the request (populated by JWT strategy during authentication)
    const user = request.user as { roles?: string[] } | undefined;

    // Deny access if user is not authenticated or doesn't have roles array
    if (!user || !Array.isArray(user.roles)) return false;

    // Check if user has at least one of the required roles
    // Returns true if any required role matches any of the user's roles
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
