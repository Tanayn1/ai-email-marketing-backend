import { Test, TestingModule } from '@nestjs/testing';
import { EspApiKeysService } from './esp-api-keys.service';

describe('EspApiKeysService', () => {
  let service: EspApiKeysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EspApiKeysService],
    }).compile();

    service = module.get<EspApiKeysService>(EspApiKeysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
