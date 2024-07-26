import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { EditorService } from './editor.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetImageDto, ManualEditSessionDto, SaveSessionDto } from './dto/editor.dto';
import { Response } from 'express';

@Controller('editor')
export class EditorController {
    constructor(private editorService: EditorService) {}

    @Post('createManualSession')
    @UseGuards(AuthGuard)
    createManualSession(@Body() dto: ManualEditSessionDto, @Req() req, @Res() res: Response) {
        const userId = req.user.sub
        return this.editorService.manualEditingSession(userId, dto, res)
    }

    @Get('getSession/:id')
    @UseGuards(AuthGuard)
    getSession(@Param('id') id : string, @Req() req, @Res() res: Response) {
        return this.editorService.fetchEditingSession(id, res)
    }

    
    @Get('getUserSessions')
    @UseGuards(AuthGuard)
    getUserSessions(@Req() req, @Res() res: Response) {
        const userId = req.user.sub;
        return this.editorService.fetchAllEditingSessions(userId, res)
    }

    @Post('saveEmail')
    @UseGuards(AuthGuard)
    saveEmail(@Body() dto: SaveSessionDto, @Req() req, @Res() res: Response ) {
        return this.editorService.saveSession(dto, res)
    }

    @Post('htmlToImage')
    @UseGuards(AuthGuard)
    getImage(@Body() dto: GetImageDto, @Req() req, @Res() res: Response) {
        return this.editorService.htmlToImage(dto, res)
    }

}
