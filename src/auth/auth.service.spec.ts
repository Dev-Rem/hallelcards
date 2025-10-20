import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  it('login returns access token for valid credentials', async () => {
    const hashed = await bcrypt.hash('P@ssw0rd', 1);
    const userDoc: any = {
      _id: '507f1f77bcf86cd799439011',
      email: 'a@b.com',
      roles: ['user'],
      passwordHash: hashed,
    };

    const userModel: any = { findOne: jest.fn().mockResolvedValue(userDoc) };
    const emailTokenModel: any = {};
    const jwt: any = { signAsync: jest.fn().mockResolvedValue('jwt-token') };
    const config: any = { get: jest.fn() };

    const service = new AuthService(userModel, emailTokenModel, jwt, config);
    const res = await service.login({
      email: 'a@b.com',
      password: 'P@ssw0rd',
    } as any);
    expect(res).toEqual({ accessToken: 'jwt-token' });
    expect(jwt.signAsync).toHaveBeenCalled();
  });
});
