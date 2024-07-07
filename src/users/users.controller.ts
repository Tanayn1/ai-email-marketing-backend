import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request, Response } from 'express';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get('getUser')
    @UseGuards(AuthGuard)
    getUser(@Req() req , @Res() res : Response) {
        const userId = req.user.sub
        return this.usersService.getUser(userId, res)
    }
}
