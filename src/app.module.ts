import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { BrandsModule } from './brands/brands.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { EditorModule } from './editor/editor.module';

@Module({
  imports: [AuthModule, PrismaModule, BrandsModule, ProductsModule, UsersModule, EditorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
