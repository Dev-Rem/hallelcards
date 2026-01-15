import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../common/roles.decorator';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminUpdateUserRequestDto } from './dto/user-requests.dto';
import { DeletedDto, UserViewDto } from './dto/user-responses.dto';

@ApiTags('admin-users')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiOkResponse({ description: 'Users list', type: [UserViewDto] })
  async findAll() {
    return this.users.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one user by id' })
  @ApiParam({ name: 'id', description: 'User id' })
  @ApiOkResponse({ description: 'User detail', type: UserViewDto })
  async findOne(@Param('id') id: string) {
    return this.users.findOneById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user (admin)' })
  @ApiParam({ name: 'id', description: 'User id' })
  @ApiOkResponse({ description: 'Updated user', type: UserViewDto })
  async update(
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserRequestDto,
  ) {
    return this.users.updateUserByAdmin(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User id' })
  @ApiOkResponse({ description: 'Delete result', type: DeletedDto })
  async delete(@Param('id') id: string) {
    return this.users.deleteUser(id);
  }
}
