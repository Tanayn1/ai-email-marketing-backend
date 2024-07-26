import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { EspApiKeysService } from './esp-api-keys.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Response } from 'express';
import { CreateCampaignDto, CreateKeyDto } from './dto/esp.dto';

@Controller('esp-api-keys')
export class EspApiKeysController {
    constructor(private ESPService: EspApiKeysService) {}

    @Get('api_keys')
    @UseGuards(AuthGuard)
    getKeys(@Req() req, @Res() res: Response) {
        const userId = req.user.sub;
        return this.ESPService.fetchKeys(userId, res);
    }

    @Post('create_api_key')
    @UseGuards(AuthGuard)
    createKey(@Body() dto: CreateKeyDto, @Req() req, @Res() res: Response) {
        const userId = req.user.sub;
        return this.ESPService.createkey(dto, userId, res);
    }

    @Post('createCampaign')
    @UseGuards(AuthGuard)
    createCampaign(@Body() dto: CreateCampaignDto, @Req() req, @Res() res: Response ) {
        const userId = req.user.sub;
        return this.ESPService.createCampaign(dto, userId, res)
    }
}
