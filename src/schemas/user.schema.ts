import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ required: true, unique: true })
  user_id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Apartment',
    default: [],
  })
  bookmarks: mongoose.Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
