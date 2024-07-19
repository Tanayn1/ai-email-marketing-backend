import { Controller, Get } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
    constructor(private AiService: AiService) {}

    @Get('/test')
    test() {
        return this.AiService.preFillTemplate()
    }
}
