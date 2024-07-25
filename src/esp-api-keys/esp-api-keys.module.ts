import { Module } from '@nestjs/common';
import { EspApiKeysController } from './esp-api-keys.controller';
import { EspApiKeysService } from './esp-api-keys.service';

@Module({
  controllers: [EspApiKeysController],
  providers: [EspApiKeysService]
})
export class EspApiKeysModule {}
