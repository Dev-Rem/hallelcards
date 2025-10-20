import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).lean();
  }

  /** -------- Admin Services -------- */

  async findAll(): Promise<User[]> {
    return this.userModel.find().lean();
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserByAdmin(id: string, update: Partial<User>): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: update }, { new: true })
      .lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async deleteUser(id: string): Promise<{ deleted: boolean }> {
    const result = await this.userModel.findByIdAndDelete(id);
    return { deleted: !!result };
  }
}
