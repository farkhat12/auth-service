import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

  @Prop()
  bookmarked?: [{ post_id: string; bookmarked: string }];
}



export const UserSchema = SchemaFactory.createForClass(User);
