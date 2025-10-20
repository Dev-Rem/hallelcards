import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findById: jest.fn().mockResolvedValue({ id: '123', name: 'John Doe' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should return current user profile', async () => {
    const result = await controller.me({ user: { userId: '123' } });
    expect(result).toEqual({ id: '123', name: 'John Doe' });
    expect(mockUsersService.findById).toHaveBeenCalledWith('123');
  });
});
