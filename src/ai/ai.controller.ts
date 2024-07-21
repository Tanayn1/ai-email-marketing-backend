import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateEmailDto } from './dto/ai.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Response } from 'express';

@Controller('ai')
export class AiController {
    constructor(private AiService: AiService) {}

    @Post('generateEmail')
    @UseGuards(AuthGuard)
    GenerateEmail(@Body() dto: GenerateEmailDto, @Req() req, @Res() res : Response) {
        const user_id = req.user.sub
        return this.AiService.generateEmail(dto, user_id, res)
    }
}
