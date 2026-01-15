import { ApiProperty } from '@nestjs/swagger';

export class UserViewDto {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty() isEmailVerified!: boolean;
  @ApiProperty() name!: string;
  @ApiProperty({ type: [String] }) roles!: string[];
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class DeletedDto {
  @ApiProperty() deleted!: boolean;
}
