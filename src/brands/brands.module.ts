import { Module } from '@nestjs/common';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports:[AwsModule],
  controllers: [BrandsController],
  providers: [BrandsService]
})
export class BrandsModule {}
