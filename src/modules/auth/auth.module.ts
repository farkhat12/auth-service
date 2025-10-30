import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { AuthRepo } from 'src/repositories/auth.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { OtpService } from './services/otp.service';
import { createClient } from 'redis';
import { TokenService } from './services/token.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    AuthRepo,
    TokenService,
    JwtService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient({ url: process.env.REDIS_URL });
        await client.connect();
        return client;
      },
    },
  ],
  exports: [MongooseModule, TokenService, AuthRepo],
})
export class AuthModule {}
