import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../../utils/constants';
export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  isEmailVerified: boolean;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: 'Anonymous' })
  name: string;

  @Prop({
    type: [String],
    enum: UserRole,
    default: [UserRole.USER],
  })
  roles: UserRole[];
}

export const UserSchema = SchemaFactory.createForClass(User);
