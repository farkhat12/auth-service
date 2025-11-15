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
import { diskStorage } from 'multer';

@Module({
  imports: [
    AuthModule,
    ProfileModule,
    ApartmentsModule,
    BookmarksModule,
    MulterModule.register({
      storage: diskStorage({
        // Resolve to an absolute path for safety
        destination: path.join(__dirname, '..', 'uploads'),
        filename: (req, file, cb) => {
          // Generate a unique filename (e.g., fieldname-timestamp.ext)
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = path.parse(file.originalname).ext;
          cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
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
