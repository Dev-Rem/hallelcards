import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// Injectable decorator makes this class available for dependency injection
@Injectable()
// AdminJwtStrategy extends PassportStrategy to create a custom JWT authentication strategy
// The second parameter 'admin-jwt' is the strategy name used by guards
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(private readonly config: ConfigService) {
    // Call parent constructor with JWT configuration options
    super({
      // Extract JWT token from Authorization header as Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Don't ignore token expiration - expired tokens will be rejected
      ignoreExpiration: false,
      // Use admin-specific JWT secret, fallback to general JWT secret if not set
      secretOrKey:
        config.get<string>('JWT_ADMIN_SECRET') ||
        config.get<string>('JWT_SECRET'),
    });
  }

  // Validate method is called after JWT is successfully decoded
  // payload contains the decoded JWT claims
  validate(payload: { sub: string; roles: string[] }) {
    // Check if the user has admin role - throw error if not
    if (!payload?.roles?.includes('admin')) {
      throw new UnauthorizedException('Admin access required');
    }
    // Return user object that will be attached to the request
    // sub (subject) contains the user ID, roles contains user permissions
    return { userId: payload.sub, roles: payload.roles };
  }
}
