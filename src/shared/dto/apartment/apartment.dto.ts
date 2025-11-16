import { Prop } from '@nestjs/mongoose';

export class ApartmentDto {
  @Prop({ required: true })
  address: string;
}
