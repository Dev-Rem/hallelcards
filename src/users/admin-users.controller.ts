import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AdminJwtStrategy } from '../auth/jwt-admin.strategy';
import { Roles } from '../common/roles.decorator';

class UpdateUserDto {
  name?: string;
  email?: string;
  role?: string; // e.g., "admin" | "user"
}

@ApiTags('admin-users')
@ApiBearerAuth('access-token')
@UseGuards(AdminJwtStrategy, Roles)
@Roles('admin')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async findAll() {
    return this.users.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.users.findOneById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.users.updateUserByAdmin(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.users.deleteUser(id);
  }
}
