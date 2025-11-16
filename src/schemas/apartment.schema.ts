import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApartmentDocument = Apartment & Document;

@Schema({ timestamps: true })
export class Apartment {
  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  orientiration: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  rooms: number;

  @Prop({ required: true })
  type: 'long' | 'short';

  @Prop({ required: true })
  for: string;

  @Prop()
  amenities: string;

  @Prop({ required: true })
  images: Array<string>;

  @Prop({
    type: String,
    ref: 'User',
    index: true,
    required: true,
  })
  ownerId: string;


  @Prop({ default: 'active', enum: ['active', 'archived'] })
  status: string;
}

export const ApartmentSchema = SchemaFactory.createForClass(Apartment);

ApartmentSchema.index({ ownerId: -1 }); // My Apartments үшін
ApartmentSchema.index({ createdAt: -1 }); // Соңғы пәтерлерді шығару үшін
ApartmentSchema.index({ city: 1, price: 1 }); // City + Price фильтрлеу
