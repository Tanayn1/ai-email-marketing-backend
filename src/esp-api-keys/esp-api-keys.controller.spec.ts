import { Test, TestingModule } from '@nestjs/testing';
import { EspApiKeysController } from './esp-api-keys.controller';

describe('EspApiKeysController', () => {
  let controller: EspApiKeysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EspApiKeysController],
    }).compile();

    controller = module.get<EspApiKeysController>(EspApiKeysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
