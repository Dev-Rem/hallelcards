import { Test, TestingModule } from '@nestjs/testing';
import { AdminUsersController } from './admin-users.controller';
import { UsersService } from './users.service';

describe('AdminUsersController', () => {
  let controller: AdminUsersController;

  const mockUsersService = {
    findAll: jest.fn().mockResolvedValue([{ id: '1', name: 'John' }]),
    findOneById: jest.fn().mockResolvedValue({ id: '1', name: 'John' }),
    updateUserByAdmin: jest.fn().mockResolvedValue({ id: '1', name: 'Jane' }),
    deleteUser: jest.fn().mockResolvedValue({ deleted: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<AdminUsersController>(AdminUsersController);
  });

  it('should return all users', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([{ id: '1', name: 'John' }]);
    expect(mockUsersService.findAll).toHaveBeenCalled();
  });

  it('should return a single user by id', async () => {
    const result = await controller.findOne('1');
    expect(result).toEqual({ id: '1', name: 'John' });
    expect(mockUsersService.findOneById).toHaveBeenCalledWith('1');
  });

  it('should update a user by id', async () => {
    const result = await controller.update('1', { name: 'Jane' });
    expect(result).toEqual({ id: '1', name: 'Jane' });
    expect(mockUsersService.updateUserByAdmin).toHaveBeenCalledWith('1', {
      name: 'Jane',
    });
  });

  it('should delete a user by id', async () => {
    const result = await controller.delete('1');
    expect(result).toEqual({ deleted: true });
    expect(mockUsersService.deleteUser).toHaveBeenCalledWith('1');
  });
});
