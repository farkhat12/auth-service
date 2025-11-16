import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileModule } from './modules/profile/profile.module';
import { ApartmentsModule } from './modules/apartments/apartments.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import path, { join } from 'path';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { AuthenticatedRequest } from './modules/profile/profile.controller';

@Module({
  imports: [
    AuthModule,
    ProfileModule,
    ApartmentsModule,
    BookmarksModule,
    MulterModule.register({
      storage: diskStorage({
        // Resolve to an absolute path for safety
        destination: (req: any, file, cb) => {
          const userId = req.user?.user_id;

          // Папка жолы
          const userFolder = join(process.cwd(), 'uploads', String(userId));

          // Егер папка жоқ болса → ашамыз
          if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
          }

          cb(null, userFolder);
        },

        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + file.originalname;
          cb(null, unique);
        },
      }),
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
